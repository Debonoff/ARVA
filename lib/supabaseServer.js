import { createClient } from "@supabase/supabase-js";

// Серверный Supabase с service_role ключом. Обходит RLS — используется
// ТОЛЬКО в серверных обработчиках (движок роста /api/cron/growth).
// НИКОГДА не импортируйте этот файл в клиентские компоненты.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY или NEXT_PUBLIC_SUPABASE_URL не заданы");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
