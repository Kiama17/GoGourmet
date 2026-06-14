import { init, track as amplitudeTrack } from "@amplitude/analytics-react-native";
import Constants from "expo-constants";

const expoConfig = (Constants as any).expoConfig ?? (Constants as any).manifest;
const AMPLITUDE_API_KEY = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY || expoConfig?.extra?.amplitudeApiKey || "";

if (AMPLITUDE_API_KEY) {
  init(AMPLITUDE_API_KEY, undefined, {
    flushIntervalMillis: 30000,
    minIdLength: 1,
  });
}

type EventName =
  | "order_placed"
  | "order_cancelled"
  | "payment_initiated"
  | "payment_success"
  | "payment_failed"
  | "menu_view"
  | "item_added_to_cart"
  | "item_removed_from_cart"
  | "item_favorited"
  | "item_unfavorited"
  | "user_registered"
  | "user_logged_in"
  | "user_logged_out"
  | "search_performed"
  | "address_changed";

type EventProperties = Record<string, string | number | boolean>;

function track(event: EventName, properties?: EventProperties): void {
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, properties ?? "");
  }

  try {
    amplitudeTrack(event, properties);
  } catch {
    /* silent */
  }
}

export const analytics = { track };
