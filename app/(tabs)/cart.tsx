import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../context/CartContext";
import { useApp } from "../../hooks/useApp";

type CartItemRowProps = {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  };
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
};

const CartItemRow = memo(function CartItemRow({
  item,
  onIncrease,
  onDecrease,
}: CartItemRowProps) {
  const { colors } = useApp();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>KES {item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.qtyButton, { backgroundColor: colors.text }]}
            onPress={() => onDecrease(item.id)}
            accessibilityLabel={`Decrease quantity of ${item.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyButton, { backgroundColor: colors.text }]}
            onPress={() => onIncrease(item.id)}
            accessibilityLabel={`Increase quantity of ${item.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.itemTotal, { color: colors.text }]}>KES {item.price * item.quantity}</Text>
    </View>
  );
});

export default function CartScreen() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    totalPrice,
    loading,
    error,
    clearError,
  } = useCart();
  const { colors, t } = useApp();
  const router = useRouter();

  const handleIncrease = useCallback(
    (id: string) => increaseQuantity(id),
    [increaseQuantity],
  );
  const handleDecrease = useCallback(
    (id: string) => decreaseQuantity(id),
    [decreaseQuantity],
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof cartItems)[0] }) => (
      <CartItemRow
        item={item}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
      />
    ),
    [handleIncrease, handleDecrease],
  );

  const itemTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  if (loading) {
    return <LoadingSpinner fullScreen skeleton="cart" />;
  }

  if (error) {
    return <ErrorMessage message={error} onDismiss={clearError} onRetry={clearError} />;
  }

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("cart.title")}</Text>
        <EmptyState
          icon="cart-outline"
          title={t("cart.empty")}
          subtitle="Browse our menu and add items you'd love to eat"
          ctaLabel={t("cart.browse")}
          onCtaPress={() => router.push("/(tabs)/home")}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("cart.title")}</Text>
      <Text style={[styles.subtitle, { color: colors.subText }]}>
        {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
      </Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        windowSize={5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
      />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.total, { color: colors.primary }]}>KES {itemTotal}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.text }]}
          onPress={() => router.push("/checkout")}
          accessibilityLabel={t("cart.proceed")}
          accessibilityRole="button"
        >
          <Text style={styles.checkoutButtonText}>{t("cart.proceed")}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    marginBottom: 15,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  qtyButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  quantity: {
    marginHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  footer: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  total: {
    fontSize: 24,
    fontWeight: "bold",
  },
  checkoutButton: {
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
