import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ENV VALUES:", {
    VITE_SUPABASE_URL: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  });
  throw new Error("Supabase env missing. Restart Vite after fixing .env");
}

// ✅ Fetch with timeout so requests never hang forever (prevents stuck loading)
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeout));
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithTimeout },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ✅ export BOTH (named + default) so koi file break na ho
export { supabase };
export default supabase;
