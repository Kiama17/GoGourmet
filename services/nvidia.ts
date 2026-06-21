import Constants from "expo-constants";
import { MenuItem } from "./menu";

const expoExtra =
  (Constants as any).expoConfig?.extra ??
  (Constants as any).manifest?.extra ??
  {};
const NVIDIA_API_KEY =
  process.env.NVIDIA_API_KEY || expoExtra.nvidiaApiKey || "";
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

function buildHeaders(): Record<string, string> {
  return {
    "Authorization": `Bearer ${NVIDIA_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function chatCompletion(messages: { role: string; content: string }[], model = "meta/llama-3.1-8b-instruct", maxTokens = 512) {
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`NVIDIA API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function getAiRecommendations(menu: MenuItem[], userHistory?: string[]): Promise<string[]> {
  const menuSummary = menu.map((m) => `${m.name} (${m.category}) - KES ${m.price}`).join("\n");
  const history = userHistory?.length ? `User has previously ordered: ${userHistory.join(", ")}.` : "No order history yet.";
  const prompt = `You are a food recommendation AI for GoGourmet delivery app. Based on the available menu items and user history, recommend 3-5 items that would be most appealing.

Available menu:
${menuSummary}

${history}

Return only a JSON array of item names, nothing else. Example: ["Item1", "Item2", "Item3"]`;

  try {
    const result = await chatCompletion([
      { role: "system", content: "You are a helpful food recommendation assistant. Return only valid JSON." },
      { role: "user", content: prompt },
    ]);
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed)) return parsed.filter((n): n is string => typeof n === "string");
    return [];
  } catch {
    return [];
  }
}

export async function smartSearch(query: string, menu: MenuItem[]): Promise<MenuItem[]> {
  if (!query.trim()) return menu;

  const menuSummary = menu.map((m) => `- ${m.name}: ${m.description} (KES ${m.price}, ${m.category})`).join("\n");
  const prompt = `You are a semantic food search engine. Given the user's search query and the menu below, return the names of the most relevant items (up to 5) that match the intent of the query.

User query: "${query}"

Available menu:
${menuSummary}

Return only a JSON array of item names matching the query. Example: ["Item1", "Item2"]`;

  try {
    const result = await chatCompletion([
      { role: "system", content: "You are a semantic search assistant. Return only valid JSON." },
      { role: "user", content: prompt },
    ], "meta/llama-3.1-8b-instruct", 256);
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed)) {
      const names = parsed.filter((n): n is string => typeof n === "string");
      const nameSet = new Set(names.map((n) => n.toLowerCase()));
      return menu.filter((m) => nameSet.has(m.name.toLowerCase()));
    }
    return [];
  } catch {
    return [];
  }
}
