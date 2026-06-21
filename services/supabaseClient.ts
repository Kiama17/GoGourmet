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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
