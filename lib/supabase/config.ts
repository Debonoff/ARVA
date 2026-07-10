export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True when Supabase credentials are present. When false, the app runs in a
 * local demo mode (data persisted in the browser) so it stays fully usable
 * until a Supabase project is connected. See `.env.example`.
 */
export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
