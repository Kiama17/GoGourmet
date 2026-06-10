import { act, renderHook } from "@testing-library/react-native";
import React, { ReactNode } from "react";
import { CartProvider, useCart } from "../CartContext";

jest.mock("../AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const sampleItem = {
  id: "1",
  name: "Burger Deluxe",
  price: 850,
  image: "https://example.com/burger.jpg",
  quantity: 1,
};

describe("CartContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toEqual([]);
  });

  it("starts with loading true", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("starts with totalItems as 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.totalItems).toBe(0);
  });

  it("starts with totalPrice as 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.totalPrice).toBe(0);
  });

  it("starts with no error", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.error).toBeNull();
  });

  it("adds item to cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
    });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].name).toBe("Burger Deluxe");
    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it("increases quantity when adding same item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
    });
    act(() => {
      result.current.addToCart(sampleItem);
    });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it("calculates totalItems correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
      result.current.addToCart(sampleItem);
    });
    expect(result.current.totalItems).toBe(2);
  });

  it("calculates totalPrice correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
    });
    expect(result.current.totalPrice).toBe(850);
  });

  it("increases quantity of existing item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
    });
    act(() => {
      result.current.increaseQuantity("1");
    });
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it("decreases quantity of existing item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
      result.current.addToCart(sampleItem);
    });
    act(() => {
      result.current.decreaseQuantity("1");
    });
    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it("removes item when quantity reaches 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
    });
    act(() => {
      result.current.decreaseQuantity("1");
    });
    expect(result.current.cartItems).toHaveLength(0);
  });

  it("clears the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart(sampleItem);
      result.current.addToCart({ ...sampleItem, id: "2", name: "Pizza" });
    });
    expect(result.current.cartItems).toHaveLength(2);
    act(() => {
      result.current.clearCart();
    });
    expect(result.current.cartItems).toHaveLength(0);
  });

  it("clears error", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("handles multiple items with different quantities", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const pizza = { ...sampleItem, id: "2", name: "Pizza", price: 1200 };
    act(() => {
      result.current.addToCart(sampleItem);
      result.current.addToCart(sampleItem);
      result.current.addToCart(pizza);
    });
    expect(result.current.cartItems).toHaveLength(2);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBe(850 * 2 + 1200);
  });
});
