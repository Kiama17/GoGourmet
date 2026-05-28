import { act, renderHook } from "@testing-library/react-native";
import React, { ReactNode } from "react";
import { FavoritesProvider, useFavorites } from "../FavoritesContext";

const wrapper = ({ children }: { children: ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
);

const sampleItem = {
  id: "1",
  name: "Burger Deluxe",
  price: 850,
  image: "https://example.com/burger.jpg",
};

describe("FavoritesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with empty favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.favorites).toEqual([]);
  });

  it("starts with loading true", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("adds a favorite", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    act(() => {
      result.current.addFavorite(sampleItem);
    });
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].name).toBe("Burger Deluxe");
  });

  it("removes a favorite", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    act(() => {
      result.current.addFavorite(sampleItem);
    });
    expect(result.current.favorites).toHaveLength(1);
    act(() => {
      result.current.removeFavorite("1");
    });
    expect(result.current.favorites).toHaveLength(0);
  });

  it("checks if item is favorite", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.isFavorite("1")).toBe(false);
    act(() => {
      result.current.addFavorite(sampleItem);
    });
    expect(result.current.isFavorite("1")).toBe(true);
    expect(result.current.isFavorite("2")).toBe(false);
  });

  it("toggles favorite on and off", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await act(async () => {
      await result.current.toggleFavorite(sampleItem);
    });
    expect(result.current.favorites).toHaveLength(1);
    await act(async () => {
      await result.current.toggleFavorite(sampleItem);
    });
    expect(result.current.favorites).toHaveLength(0);
  });

  it("supports multiple favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    const item2 = { ...sampleItem, id: "2", name: "Pizza" };
    act(() => {
      result.current.addFavorite(sampleItem);
      result.current.addFavorite(item2);
    });
    expect(result.current.favorites).toHaveLength(2);
  });

  it("does not duplicate favorites on add", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    act(() => {
      result.current.addFavorite(sampleItem);
      result.current.addFavorite(sampleItem);
    });
    expect(result.current.favorites).toHaveLength(2);
  });
});
