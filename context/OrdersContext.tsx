import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { scheduleLocalNotification } from "../services/notifications";
import { analytics } from "../services/analytics";

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

type PlaceOrderDetails = { address?: string; phone?: string; navigateToOrders?: boolean; status?: string };

type OrdersContextType = {
  orders: Order[];
  placeOrder: (details?: PlaceOrderDetails) => Promise<string | void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // REAL-TIME ORDER TRACKING
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
          const updated = payload.new as any;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
          );
          const prevOrder = orders.find((o) => o.id === updated.id);
          if (prevOrder && prevOrder.status !== updated.status) {
            const statusMessages: Record<string, string> = {
              Preparing: "Your order is now being prepared!",
              Delivered: "Your order has been delivered. Enjoy!",
              Cancelled: "Your order has been cancelled.",
            };
            const body = statusMessages[updated.status];
            if (body) {
              scheduleLocalNotification({ title: "Order Update", body, data: { orderId: updated.id, type: "order_status" } });
            }
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const placeOrder = async (details?: { address?: string; phone?: string; navigateToOrders?: boolean; status?: string }): Promise<string | void> => {
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
        status: details?.status || "Preparing",
        date: new Date().toLocaleDateString("en-KE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        delivery_address: details?.address || "",
        phone: details?.phone || "",
      };

      const { data, error } = await supabase.from("orders").insert(newOrder).select("id").single();
      if (error) throw error;

      for (const item of cartItems) {
        await supabase.rpc("decrement_stock", { item_id: item.id, qty: item.quantity });
      }

      await clearCart();
      analytics.track("order_placed", { order_id: data?.id, total: totalPrice });
      scheduleLocalNotification({
        title: "Order Confirmed!",
        body: "Your order has been placed successfully.",
        data: { orderId: data?.id, type: "order_placed" },
      });
      if (details?.navigateToOrders !== false) {
        router.push("/(tabs)/orders");
      }
      return data?.id;
    } catch (error) {
      console.error("Failed to place order:", error);
      analytics.track("payment_failed", { error: (error as Error).message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) throw error;
    const statusMessages: Record<string, string> = {
      Preparing: "Your order is now being prepared!",
      Delivered: "Your order has been delivered. Enjoy!",
      Cancelled: "Your order has been cancelled.",
    };
    const body = statusMessages[status];
    if (body) {
      scheduleLocalNotification({ title: "Order Update", body, data: { orderId, type: "order_status" } });
    }
  };

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "Cancelled" }).eq("id", orderId);
    if (error) throw error;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
    );
    analytics.track("order_cancelled", { order_id: orderId });
    scheduleLocalNotification({
      title: "Order Cancelled",
      body: "Your order has been cancelled.",
      data: { orderId, type: "order_cancelled" },
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (err) {
      setError("Failed to load orders");
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <OrdersContext.Provider
        value={{ orders, placeOrder, updateOrderStatus, cancelOrder, fetchOrders, loading, error }}
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