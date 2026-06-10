import { cache } from "../cache";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockGetAllKeys = jest.fn();
const mockMultiRemove = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: any[]) => mockGetItem(...args),
  setItem: (...args: any[]) => mockSetItem(...args),
  removeItem: (...args: any[]) => mockRemoveItem(...args),
  getAllKeys: (...args: any[]) => mockGetAllKeys(...args),
  multiRemove: (...args: any[]) => mockMultiRemove(...args),
}));

describe("cache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("returns null when no cached value", async () => {
      mockGetItem.mockResolvedValue(null);
      const result = await cache.get("test-key");
      expect(result).toBeNull();
    });

    it("returns parsed data when cache is valid", async () => {
      mockGetItem.mockResolvedValue(
        JSON.stringify({ data: { name: "test" }, expiry: Date.now() + 60000 })
      );
      const result = await cache.get<{ name: string }>("test-key");
      expect(result).toEqual({ name: "test" });
    });

    it("returns null and removes key when cache expired", async () => {
      mockGetItem.mockResolvedValue(
        JSON.stringify({ data: "old", expiry: Date.now() - 1000 })
      );
      const result = await cache.get("test-key");
      expect(result).toBeNull();
      expect(mockRemoveItem).toHaveBeenCalledWith("cache:test-key");
    });

    it("returns null on parse error", async () => {
      mockGetItem.mockResolvedValue("not-json");
      const result = await cache.get("test-key");
      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("stores data with expiry", async () => {
      await cache.set("key", { foo: "bar" });
      expect(mockSetItem).toHaveBeenCalledTimes(1);
      const callArg = mockSetItem.mock.calls[0][1];
      const parsed = JSON.parse(callArg);
      expect(parsed.data).toEqual({ foo: "bar" });
      expect(parsed.expiry).toBeGreaterThan(Date.now());
    });

    it("does not throw when storage fails", async () => {
      mockSetItem.mockRejectedValue(new Error("storage full"));
      await expect(cache.set("key", "val")).resolves.toBeUndefined();
    });
  });

  describe("remove", () => {
    it("removes cache key", async () => {
      await cache.remove("key");
      expect(mockRemoveItem).toHaveBeenCalledWith("cache:key");
    });
  });

  describe("clear", () => {
    it("removes all cache keys", async () => {
      mockGetAllKeys.mockResolvedValue(["cache:a", "other", "cache:b"]);
      await cache.clear();
      expect(mockMultiRemove).toHaveBeenCalledWith(["cache:a", "cache:b"]);
    });

    it("does nothing when no cache keys", async () => {
      mockGetAllKeys.mockResolvedValue(["other"]);
      await cache.clear();
      expect(mockMultiRemove).not.toHaveBeenCalled();
    });
  });

  describe("withCache", () => {
    it("returns cached value when available", async () => {
      mockGetItem.mockResolvedValue(
        JSON.stringify({ data: "cached-data", expiry: Date.now() + 60000 })
      );
      const fetcher = jest.fn().mockResolvedValue("fresh-data");
      const result = await cache.withCache("key", fetcher);
      expect(result).toBe("cached-data");
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("calls fetcher and caches result when no cache", async () => {
      mockGetItem.mockResolvedValue(null);
      const fetcher = jest.fn().mockResolvedValue("fresh-data");
      const result = await cache.withCache("key", fetcher);
      expect(result).toBe("fresh-data");
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(mockSetItem).toHaveBeenCalled();
    });
  });

  describe("prefix", () => {
    it("uses cache: prefix for all keys", async () => {
      mockGetItem.mockResolvedValue(null);
      const fetcher = jest.fn().mockResolvedValue("val");
      await cache.withCache("menu:1:50", fetcher);
      expect(mockGetItem).toHaveBeenCalledWith("cache:menu:1:50");
    });
  });
});
