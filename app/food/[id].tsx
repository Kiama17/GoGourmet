import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";

import { useCart } from "../../context/CartContext";
import { getMenuItemById, MenuItem } from "../../services/menu";
import { useApp } from "../../hooks/useApp";
import { shareMenuItem } from "../../services/share";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const { colors } = useApp();
  const [food, setFood] = useState<MenuItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadFood = useCallback(() => {
    if (!id) return;
    setFood(null);
    setNotFound(false);
    getMenuItemById(id as string)
      .then((item) => {
        if (item) { setFood(item); } else { setNotFound(true); }
      })
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => { loadFood(); }, [loadFood]);

  const handleAddToCart = useCallback(() => {
    if (!food) return;
    addToCart({ id: food.id, name: food.name, price: food.price, image: food.image, quantity: 1 });
    router.push("/(tabs)/cart");
  }, [food, addToCart]);

  const handleShare = useCallback(() => {
    if (!food) return;
    shareMenuItem(food.name, food.price, food.description);
  }, [food]);

  if (!food) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        {notFound ? (
          <>
            <Ionicons name="sad-outline" size={60} color={colors.subText} />
            <Text style={[styles.notFoundText, { color: colors.subText }]}>Food not found</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadFood} accessibilityLabel="Retry loading food" accessibilityRole="button">
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : (
          <LoadingSpinner />
        )}
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} bounces={false}>
      <Image source={{ uri: food.image }} style={styles.image} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }], backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: colors.text }]}>{food.name}</Text>
          <View style={[styles.ratingBadge, { backgroundColor: colors.card }]}>
            <Ionicons name="star" size={16} color="#ffc107" />
            <Text style={[styles.rating, { color: colors.text }]}>{food.rating}</Text>
          </View>
        </View>
        <Text style={[styles.category, { color: colors.subText }]}>{food.category}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>KES {food.price}</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.descriptionLabel, { color: colors.text }]}>Description</Text>
        <Text style={[styles.description, { color: colors.subText }]}>{food.description}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.shareButton, { borderColor: colors.primary }]}
            onPress={handleShare}
            accessibilityLabel="Share food item"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
            accessibilityLabel="Add to Cart"
            accessibilityRole="button"
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: "100%", height: 340 },
  content: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 30, fontWeight: "bold", flex: 1 },
  ratingBadge: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  rating: { fontSize: 15, fontWeight: "bold" },
  category: { fontSize: 15, marginTop: 6 },
  price: { fontSize: 26, fontWeight: "bold", marginTop: 12 },
  divider: { height: 1, marginVertical: 20 },
  descriptionLabel: { fontSize: 17, fontWeight: "600", marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 26 },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 40 },
  shareButton: {
    borderWidth: 2, borderRadius: 14, width: 56, height: 56,
    justifyContent: "center", alignItems: "center",
  },
  button: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 10, padding: 18, borderRadius: 14,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  notFoundText: { fontSize: 18 },
  retryButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, marginTop: 16 },
  retryButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
