/** Midnight Ledger system: secure browser-side Supabase access only; all authority lives in RLS. */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const siteUrl = () =>
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") || window.location.origin;

export function configurationMessage() {
  return "Live content is unavailable until the Supabase environment variables are configured.";
}
