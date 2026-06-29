import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const expoExtra =
  (Constants as any).expoConfig?.extra ??
  (Constants as any).manifest?.extra ??
  {};
const supabaseUrl =
  process.env.SUPABASE_URL || expoExtra.supabaseUrl || "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || expoExtra.supabaseAnonKey || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[supabase] Missing credentials — SUPABASE_URL and SUPABASE_ANON_KEY must be set via .env or app config extra"
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : (null as any);
