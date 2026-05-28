import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect } from "react";
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Preparing":
      return "#ff9800";
    case "Delivered":
      return COLORS.success;
    case "Cancelled":
      return COLORS.danger;
    default:
      return COLORS.text;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Preparing":
      return "time-outline";
    case "Delivered":
      return "checkmark-circle-outline";
    case "Cancelled":
      return "close-circle-outline";
    default:
      return "ellipse-outline";
  }
};

const OrderCard = memo(function OrderCard({ item }: { item: any }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color="#fff" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.items?.map((food: any, index: number) => (
        <Text key={index} style={styles.itemText}>
          • {food.name} x{food.quantity}
        </Text>
      ))}

      <View style={styles.footer}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.total}>KES {item.total}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function OrdersScreen() {
  const { orders, fetchOrders, loading } = useOrders();
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <OrderCard item={item} />,
    [],
  );

  if (loading) {
    return <LoadingSpinner fullScreen skeleton />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Orders</Text>
        <EmptyState
          icon="receipt-outline"
          title="No orders yet"
          subtitle="Place your first order and track it here"
          ctaLabel="Browse Food"
          ctaIcon="cart-outline"
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
        renderItem={renderItem}
        windowSize={5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
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
  card: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  itemText: {
    fontSize: 15,
    marginBottom: 5,
  },
  footer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    color: COLORS.subText,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
