import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { CROP_DB } from "@/lib/crops";
import { growthIndex, isoDate, addDays } from "@/lib/calc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Ежедневный движок роста Arva.
  Vercel Cron вызывает этот эндпоинт по расписанию из vercel.json (раз в сутки).
  Каждый день для каждой активной грядки:
    1. берём средние температуру и влажность за сутки (последний замер фермера
       или текущий микроклимат теплицы);
    2. считаем Индекс Суточного Роста  G_i = (1/DaysToMature)*K_hydro*K_temp*K_hum;
    3. прибавляем G_i к накопленному прогрессу. Когда Σ G_i >= 1.0 — урожай готов;
    4. пересчитываем прогнозную дату сбора и создаём умные уведомления
       (задержка / опережение / готовность / подготовка логистики / стоп-рост).
*/

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // локальная разработка без секрета
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true; // так вызывает Vercel Cron
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret; // ручной запуск
}

export async function GET(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = supabaseAdmin();
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  const todayStr = isoDate();

  // Активные грядки: посаженные и ещё не собранные.
  const { data: beds, error } = await supabase
    .from("beds")
    .select("*, greenhouse:greenhouses(id,name,hydro,temp,humidity)")
    .not("plant_date", "is", null)
    .lt("progress", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!beds || beds.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, notifications: 0 });
  }

  // Последний суточный замер по каждой теплице.
  const ghIds = [...new Set(beds.map((b) => b.greenhouse_id))];
  const { data: readings } = await supabase
    .from("daily_readings")
    .select("greenhouse_id,temp,humidity,reading_date")
    .in("greenhouse_id", ghIds)
    .order("reading_date", { ascending: false });
  const latestByGh = {};
  (readings ?? []).forEach((r) => {
    if (!latestByGh[r.greenhouse_id]) latestByGh[r.greenhouse_id] = r;
  });

  // Дедупликация уведомлений: не создаём одинаковые для одной грядки за 3 дня.
  const since = isoDate(addDays(new Date(), -3));
  const { data: recentNotifs } = await supabase
    .from("notifications")
    .select("bed_id,code,created_at")
    .gte("created_at", since);
  const seen = new Set((recentNotifs ?? []).map((n) => `${n.bed_id}:${n.code}`));

  const newNotifs = [];
  let processed = 0;

  for (const bed of beds) {
    // Уже пересчитано сегодня — пропускаем (защита от двойного счёта).
    if (bed.last_progress_at === todayStr) continue;
    const ref = CROP_DB[bed.crop_type];
    if (!ref) continue;

    const gh = bed.greenhouse || {};
    const reading = latestByGh[bed.greenhouse_id];
    const temp = reading ? Number(reading.temp) : Number(gh.temp);
    const hum = reading ? Number(reading.humidity) : Number(gh.humidity);

    const gi = growthIndex(ref.daysToMature, gh.hydro, temp, hum, ref.tempOpt);
    const oldProgress = Number(bed.progress) || 0;
    const newProgress = Math.min(1, oldProgress + gi);

    const remaining = gi > 0 ? Math.ceil((1 - newProgress) / gi) : null;
    const predicted = remaining != null ? isoDate(addDays(new Date(), remaining)) : null;
    const baseline = addDays(new Date(bed.plant_date), ref.daysToMature);
    const shift = predicted ? Math.round((new Date(predicted).getTime() - baseline.getTime()) / 86400000) : 0;

    let status = "growing";
    if (newProgress >= 1) status = "ready";
    else if (gi <= 0) status = "stalled";

    await supabase
      .from("beds")
      .update({
        progress: newProgress,
        predicted_harvest: predicted,
        status,
        last_progress_at: todayStr,
      })
      .eq("id", bed.id);

    processed++;

    // ----- генерация уведомлений -----
    const base = { user_id: bed.user_id, greenhouse_id: bed.greenhouse_id, bed_id: bed.id };
    const params = { name: gh.name, crop: bed.crop_type }; // crop = ключ, отрисуется на языке интерфейса
    const push = (level, code, extra = {}) => {
      const key = `${bed.id}:${code}`;
      if (seen.has(key)) return;
      seen.add(key);
      newNotifs.push({ ...base, level, code, params: { ...params, ...extra } });
    };

    if (newProgress >= 1 && oldProgress < 1) push("good", "harvestReady");
    else if (gi <= 0) push("critical", "critical");
    else if (remaining != null && remaining <= 7 && [1, 3, 7].includes(remaining)) push("warn", "harvestSoon", { days: remaining });
    else if (shift >= 3) push("warn", "later", { days: shift });
    else if (shift <= -3) push("good", "earlier", { days: Math.abs(shift) });
  }

  if (newNotifs.length > 0) {
    await supabase.from("notifications").insert(newNotifs);
  }

  return NextResponse.json({ ok: true, date: todayStr, processed, notifications: newNotifs.length });
}
