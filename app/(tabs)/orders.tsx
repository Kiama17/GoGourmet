import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useOrders } from "../../context/OrdersContext";
import { useToast } from "../../context/ToastContext";

const statusColors: Record<string, string> = {
  Preparing: "#ff9800",
  Delivered: "#28a745",
  Cancelled: "#ff3b30",
  Pending: "#999",
};

const CANCELLABLE_STATUSES = ["Pending", "Preparing"];

export default function OrdersScreen() {
  const { orders, fetchOrders, loading, cancelOrder } = useOrders();
  const router = useRouter();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const handleCancel = (orderId: string) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            setCancellingId(orderId);
            await cancelOrder(orderId);
            showToast("Order cancelled", "info");
          } catch {
            showToast("Failed to cancel order", "error");
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen skeleton="orders" />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Orders</Text>
        <EmptyState
          icon="receipt-outline"
          title="No orders yet"
          subtitle="Place your first order and it will appear here"
          ctaLabel="Browse Food"
          onCtaPress={() => router.push("/(tabs)/home")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <Text style={styles.subtitle}>{orders.length} order{orders.length > 1 ? "s" : ""}</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || "#999" }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.date}>{item.date}</Text>
            {item.items.map((food: any) => (
              <View key={food.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{food.name} x{food.quantity}</Text>
                <Text style={styles.itemPrice}>KES {food.price * food.quantity}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>KES {item.total}</Text>
            </View>
            {CANCELLABLE_STATUSES.includes(item.status) && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancel(item.id)}
                disabled={cancellingId === item.id}
                accessibilityLabel={`Cancel order ${item.id.slice(0, 8)}`}
                accessibilityRole="button"
              >
                {cancellingId === item.id ? (
                  <LoadingSpinner size="small" color={COLORS.danger} />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.subText,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  date: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "600",
  },
});