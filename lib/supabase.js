import { createClient } from "@supabase/supabase-js";

// Клиентский Supabase (анонимный ключ). Значения — из .env.local (NEXT_PUBLIC_*).
// Плейсхолдеры нужны только чтобы сборка не падала без переменных окружения;
// в рантайме с реальными ключами всё работает.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const supabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
