import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const ORDER_COUNT_KEY = "gogourmet_order_count";
const RATE_PROMPTED_KEY = "gogourmet_rate_prompted";

export async function incrementOrderCount(): Promise<void> {
  const count = await getOrderCount();
  await AsyncStorage.setItem(ORDER_COUNT_KEY, String(count + 1));
}

export async function getOrderCount(): Promise<number> {
  const val = await AsyncStorage.getItem(ORDER_COUNT_KEY);
  return val ? parseInt(val, 10) : 0;
}

export async function shouldShowRatePrompt(): Promise<boolean> {
  const alreadyPrompted = await AsyncStorage.getItem(RATE_PROMPTED_KEY);
  if (alreadyPrompted) return false;

  const count = await getOrderCount();
  return count > 0 && count % 3 === 0;
}

export async function requestAppReview(): Promise<void> {
  try {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }
    await AsyncStorage.setItem(RATE_PROMPTED_KEY, "true");
  } catch {
    // review prompt failed silently
  }
}
