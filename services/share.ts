import { Share } from "react-native";

export async function shareMenuItem(name: string, price: number, description?: string): Promise<void> {
  const message = [
    `🍽️ ${name} - KES ${price}`,
    description ? `${description}` : "",
    "",
    "Order from GoGourmet!",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await Share.share({
      message,
      title: `Check out ${name} on GoGourmet`,
    });
  } catch {
    // user dismissed share dialog
  }
}
