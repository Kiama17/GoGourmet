import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://fvkqqhrwnhwstbyophnc.supabase.co/rest/v1/";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a3FxaHJ3bmh3c3RieW9waG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTA5NzUsImV4cCI6MjA5NTA2Njk3NX0.wv5YZM9MNvwBg6W87c2g9JQseNIg5fYJaJIORXQcBX8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
