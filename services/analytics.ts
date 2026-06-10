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
    // In production, send to your analytics provider (e.g. PostHog, Amplitude, Mixpanel).
    // Example: posthog.capture(event, properties);
  } catch {
    /* silent */
  }
}

export const analytics = { track };
