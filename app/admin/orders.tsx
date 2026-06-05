import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getAllOrders, updateOrderStatus } from "../../services/admin";

const statuses = ["Pending", "Preparing", "Delivered", "Cancelled"];

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      setOrders(data);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = useCallback((orderId: string, currentStatus: string) => {
    const nextIndex = statuses.indexOf(currentStatus) + 1;
    const nextStatus = nextIndex < statuses.length ? statuses[nextIndex] : statuses[0];

    Alert.alert("Update Status", `Change to "${nextStatus}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: async () => {
          try {
            await updateOrderStatus(orderId, nextStatus);
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
            );
          } catch {
            Alert.alert("Error", "Failed to update order status");
          }
        },
      },
    ]);
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return <ErrorMessage title="Orders Error" message={error} onRetry={loadOrders} />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState icon="receipt-outline" title="No orders" subtitle="No orders have been placed yet" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: statuses.indexOf(item.status) < 2 ? COLORS.primary : COLORS.success }]}
                onPress={() => handleStatusChange(item.id, item.status)}
              >
                <Text style={styles.statusText}>{item.status}</Text>
                <Ionicons name="chevron-down" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.date}>{item.date || new Date(item.created_at).toLocaleDateString()}</Text>
            <Text style={styles.customer}>User: {item.user_id?.slice(0, 8)}...</Text>
            {item.items?.map((food: any) => (
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
            {item.delivery_address ? (
              <Text style={styles.address} numberOfLines={2}>Deliver to: {item.delivery_address}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 30, gap: 16 },
  errorText: { fontSize: 16, color: COLORS.danger, textAlign: "center" },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderId: { fontSize: 16, fontWeight: "bold" },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  date: { fontSize: 13, color: COLORS.subText, marginBottom: 4 },
  customer: { fontSize: 13, color: COLORS.subText, marginBottom: 10 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: { fontSize: 14, color: COLORS.text },
  itemPrice: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, fontWeight: "600" },
  total: { fontSize: 20, fontWeight: "bold", color: COLORS.primary },
  address: { fontSize: 13, color: COLORS.subText, marginTop: 8 },
});
