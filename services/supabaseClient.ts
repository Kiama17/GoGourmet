import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const expoConfig = (Constants as any).expoConfig ?? (Constants as any).manifest;
const supabaseUrl = expoConfig?.extra?.supabaseUrl ?? "";
const supabaseAnonKey = expoConfig?.extra?.supabaseAnonKey ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
