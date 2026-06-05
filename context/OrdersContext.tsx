import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  date: string;
  delivery_address?: string;
  phone?: string;
  user_id: string;
};

type OrdersContextType = {
  orders: Order[];
  placeOrder: (details?: { address?: string; phone?: string }) => Promise<void>;
  fetchOrders: () => Promise<void>;
  loading: boolean;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const placeOrder = async (details?: { address?: string; phone?: string }) => {
    try {
      setLoading(true);
      if (!user) throw new Error("User not logged in");

      const newOrder = {
        user_id: user.id,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: totalPrice,
        status: "Preparing",
        date: new Date().toLocaleDateString("en-KE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        delivery_address: details?.address || "",
        phone: details?.phone || "",
      };

      const { error } = await supabase.from("orders").insert(newOrder);
      if (error) throw error;

      await clearCart();
      router.push("/(tabs)/orders");
    } catch (error) {
      console.error("Failed to place order:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrdersContext.Provider
      value={{ orders, placeOrder, fetchOrders, loading }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used inside OrdersProvider");
  }
  return context;
};