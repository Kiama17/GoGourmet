import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import { useCart } from "../../context/CartContext";
import { getMenuItemById, MenuItem } from "../../services/menu";

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [food, setFood] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      getMenuItemById(id as string).then((item) => {
        setFood(item);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!food) return;
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      quantity: 1,
    });
    router.push("/(tabs)/cart");
  };

  if (!food) {
    return (
      <View style={styles.center}>
        <Ionicons name="sad-outline" size={60} color={COLORS.subText} />
        <Text style={styles.notFoundText}>Food not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Animated.Image
        source={{ uri: food.image }}
        style={[styles.image, { opacity: fadeAnim }]}
        onLoad={() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        onLayout={() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.name}>{food.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color="#ffc107" />
            <Text style={styles.rating}>{food.rating}</Text>
          </View>
        </View>
        <Text style={styles.category}>{food.category}</Text>
        <Text style={styles.price}>KES {food.price}</Text>

        <View style={styles.divider} />

        <Text style={styles.descriptionLabel}>Description</Text>
        <Text style={styles.description}>{food.description}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 340 },
  content: { padding: 24 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 30, fontWeight: "bold", flex: 1 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff6e5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  rating: { fontSize: 15, fontWeight: "bold", color: COLORS.text },
  category: { fontSize: 15, color: COLORS.subText, marginTop: 6 },
  price: { fontSize: 26, fontWeight: "bold", color: COLORS.primary, marginTop: 12 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  descriptionLabel: { fontSize: 17, fontWeight: "600", marginBottom: 8 },
  description: {
    fontSize: 16,
    color: COLORS.subText,
    lineHeight: 26,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 14,
    marginTop: 40,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 12,
  },
  notFoundText: { fontSize: 18, color: COLORS.subText },
});