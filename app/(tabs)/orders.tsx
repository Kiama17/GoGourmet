import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useOrders } from "../../context/OrdersContext";

const statusColors: Record<string, string> = {
  Preparing: "#ff9800",
  Delivered: "#28a745",
  Cancelled: "#ff3b30",
  Pending: "#999",
};

export default function OrdersScreen() {
  const { orders, fetchOrders, loading } = useOrders();
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

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
});