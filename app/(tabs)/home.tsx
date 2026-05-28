import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useFavorites } from "../../context/FavoritesContext";
import { foods } from "../../data/foods";

const categories = ["All", "Local", "Burger", "Pizza", "Wraps", "Drinks", "Fries"];

type FoodCardProps = {
  item: (typeof foods)[0];
  onPress: () => void;
  onFavorite: () => void;
  isFav: boolean;
  loadingId: string | null;
};

const FoodCard = memo(function FoodCard({
  item,
  onPress,
  onFavorite,
  isFav,
  loadingId,
}: FoodCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavorite}
          disabled={loadingId === item.id}
        >
          {loadingId === item.id ? (
            <LoadingSpinner size="small" color="red" />
          ) : (
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color="red"
            />
          )}
        </TouchableOpacity>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{item.category}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.price}>KES {item.price}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite, loading: favoritesLoading } =
    useFavorites();
  const router = useRouter();

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ? true : food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleFavorite = useCallback(
    async (item: any) => {
      try {
        setLoadingId(item.id);
        await toggleFavorite(item);
      } catch {
        setError("Failed to update favorite. Please try again.");
      } finally {
        setLoadingId(null);
      }
    },
    [toggleFavorite],
  );

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setSelectedCategory("All");
  }, []);

  const handleCategoryPress = useCallback((cat: string) => {
    setSelectedCategory(cat);
  }, []);

  if (favoritesLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Food Delivery</Text>
        <LoadingSpinner skeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hungry?</Text>
          <Text style={styles.title}>Food Delivery</Text>
        </View>
        <TouchableOpacity
          style={styles.favIcon}
          onPress={() => router.push({ pathname: "/favourite" } as any)}
        >
          <Ionicons name="heart" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {error && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => setError(null)}
        >
          <Ionicons name="alert-circle-outline" size={18} color="#fff" />
          <Text style={styles.errorBannerText}>{error}</Text>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      )}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search food..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.localBanner}
        onPress={() => setSelectedCategory("Local")}
        activeOpacity={0.9}
      >
        <View style={styles.localBannerContent}>
          <Ionicons name="restaurant-outline" size={24} color="#fff" />
          <View style={styles.localBannerText}>
            <Text style={styles.localBannerTitle}>Taste of Kenya</Text>
            <Text style={styles.localBannerSubtitle}>
              Explore our authentic local dishes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </View>
      </TouchableOpacity>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.activeCategory,
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.activeCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={search ? "search-outline" : "fast-food-outline"}
              size={60}
              color="#ddd"
            />
            <Text style={styles.emptyTitle}>
              {search ? "No results found" : "Nothing here yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `We couldn't find anything for "${search}"`
                : `No ${selectedCategory} available right now`}
            </Text>
            {search && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSearch}
              >
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={
          filteredFoods.length === 0 ? styles.emptyList : undefined
        }
        renderItem={({ item }) => (
          <FoodCard
            item={item}
            onPress={() => router.push(`/food/${item.id}`)}
            onFavorite={() => handleToggleFavorite(item)}
            isFav={isFavorite(item.id)}
            loadingId={loadingId}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: { fontSize: 16, color: COLORS.subText, marginBottom: 2 },
  title: { fontSize: 30, fontWeight: "bold" },
  favIcon: {
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.danger,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    height: 50,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  categoryList: { marginBottom: 15 },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginRight: 10,
    height: 42,
  },
  activeCategory: { backgroundColor: COLORS.text },
  categoryText: { color: COLORS.text, fontWeight: "600" },
  activeCategoryText: { color: "#fff" },
  emptyList: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.subText,
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 30,
  },
  clearButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  clearButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  localBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    marginBottom: 15,
    overflow: "hidden",
  },
  localBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  localBannerText: { flex: 1 },
  localBannerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  localBannerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },
  cardWrapper: { marginBottom: 15 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  image: { width: 120, height: 130 },
  info: { flex: 1, padding: 12, justifyContent: "center", gap: 4 },
  name: { fontSize: 18, fontWeight: "bold" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: { color: COLORS.subText, fontSize: 13 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  price: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
  },
});
