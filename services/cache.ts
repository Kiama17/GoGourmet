import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "cache:";
const TTL_SECONDS = 5 * 60;

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

async function set(key: string, data: unknown, ttl = TTL_SECONDS): Promise<void> {
  try {
    const entry = JSON.stringify({ data, expiry: Date.now() + ttl * 1000 });
    await AsyncStorage.setItem(CACHE_PREFIX + key, entry);
  } catch {
    /* silent */
  }
}

async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    /* silent */
  }
}

async function clear(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
  } catch {
    /* silent */
  }
}

async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = TTL_SECONDS
): Promise<T> {
  const cached = await get<T>(key);
  if (cached !== null) return cached;
  const fresh = await fetcher();
  await set(key, fresh, ttl);
  return fresh;
}

export const cache = { get, set, remove, clear, withCache };
