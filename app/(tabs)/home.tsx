import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useFavorites } from "../../context/FavoritesContext";
import { getMenuItems, MenuItem } from "../../services/menu";
import { getAiRecommendations, smartSearch } from "../../services/nvidia";
import { useApp } from "../../hooks/useApp";
import { shareMenuItem } from "../../services/share";
import { sanitize } from "../../utils/sanitize";

const categories = ["All", "Burger", "Pizza", "Wraps", "Drinks", "Fries", "Local"];

interface FoodCardProps {
  item: MenuItem;
  onPress: () => void;
  onFavorite: () => void;
  isFav: boolean;
  loadingId: string | null;
  onShare: (item: MenuItem) => void;
}

function FoodCard({ item, onPress, onFavorite, isFav, loadingId, onShare }: FoodCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.95}
        accessibilityLabel={`View ${item.name}`}
        accessibilityRole="button"
      >
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavorite}
          disabled={loadingId === item.id}
          accessibilityLabel={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
          accessibilityRole="button"
        >
          {loadingId === item.id ? (
            <LoadingSpinner size="small" color="red" />
          ) : (
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color="red" />
          )}
        </TouchableOpacity>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
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
      <TouchableOpacity style={styles.shareIcon} onPress={() => onShare(item)} accessibilityLabel={`Share ${item.name}`} accessibilityRole="button">
        <Ionicons name="share-outline" size={16} color="#777" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiPicks, setAiPicks] = useState<MenuItem[]>([]);
  const [smartResults, setSmartResults] = useState<MenuItem[] | null>(null);
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();
  const { colors } = useApp();
  const router = useRouter();

  useEffect(() => {
    getMenuItems()
      .then((items) => {
        setFoods(items);
        setMenuLoading(false);
        getAiRecommendations(items).then((names) => {
          if (names.length > 0) {
            const picked = names.map((n) => items.find((m) => m.name.toLowerCase() === n.toLowerCase())).filter(Boolean) as MenuItem[];
            setAiPicks(picked);
          }
        }).catch(() => {});
      })
      .catch(() => { setError("Failed to load menu"); setMenuLoading(false); });
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSmartResults(null); return; }
    const timer = setTimeout(async () => {
      const results = await smartSearch(search, foods);
      setSmartResults(results);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, foods]);

  const displayFoods = smartResults !== null ? smartResults : foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" ? true : food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleFavorite = async (item: MenuItem) => {
    try { setLoadingId(item.id); await toggleFavorite(item); } catch { setError("Failed to update favorite. Please try again."); } finally { setLoadingId(null); }
  };

  const handleShare = (item: MenuItem) => shareMenuItem(item.name, item.price, item.description);

  if (favoritesLoading || menuLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Food Delivery</Text>
        <LoadingSpinner skeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.subText }]}>Hungry?</Text>
          <Text style={[styles.title, { color: colors.text }]}>Food Delivery</Text>
        </View>
        <TouchableOpacity style={[styles.favIcon, { backgroundColor: colors.card }]} onPress={() => router.push("/favourite")} accessibilityLabel="View favorites" accessibilityRole="button">
          <Ionicons name="heart" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <TouchableOpacity style={styles.errorBannerContent} onPress={() => { setError(null); setMenuLoading(true); getMenuItems().then((items) => { setFoods(items); setMenuLoading(false); }).catch(() => { setError("Failed to load menu"); setMenuLoading(false); }); }} accessibilityLabel="Retry loading menu" accessibilityRole="button">
            <Ionicons name="alert-circle-outline" size={18} color="#fff" />
            <Text style={styles.errorBannerText}>{error}</Text>
            <Text style={styles.retryBtn}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setError(null)} accessibilityLabel="Dismiss error" accessibilityRole="button">
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.searchContainer, { borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.subText} style={styles.searchIcon} />
        <TextInput placeholder="Search food..." value={search} onChangeText={(v) => setSearch(sanitize(v))} style={[styles.searchInput, { color: colors.text }]} placeholderTextColor={colors.subText} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} accessibilityLabel="Clear search" accessibilityRole="button">
            <Ionicons name="close-circle" size={20} color={colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      {aiPicks.length > 0 && !search && selectedCategory === "All" && (
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={[styles.aiTitle, { color: colors.text }]}>AI Picks</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={aiPicks}
            keyExtractor={(item) => `ai-${item.id}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.aiCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/food/${item.id}`)}
                accessibilityLabel={`AI recommended: ${item.name}`}
                accessibilityRole="button"
              >
                <Image source={{ uri: item.image }} style={styles.aiImage} />
                <Text style={[styles.aiItemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.aiPrice}>KES {item.price}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryButton, { backgroundColor: selectedCategory === item ? colors.text : colors.card }]}
            onPress={() => setSelectedCategory(item)}
            accessibilityLabel={`Filter by ${item}`}
            accessibilityRole="button"
          >
            <Text style={[styles.categoryText, { color: selectedCategory === item ? "#fff" : colors.text }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={displayFoods}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name={search ? "search-outline" : "fast-food-outline"} size={60} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{search ? "No results found" : "Nothing here yet"}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              {search ? `We couldn't find anything for "${search}"` : `No ${selectedCategory} available right now`}
            </Text>
            {search && (
              <TouchableOpacity style={[styles.clearButton, { backgroundColor: colors.primary }]} onPress={() => { setSearch(""); setSelectedCategory("All"); }} accessibilityLabel="Clear search and filters" accessibilityRole="button">
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={displayFoods.length === 0 ? styles.emptyList : undefined}
        renderItem={({ item }) => (
          <FoodCard
            item={item}
            onPress={() => router.push(`/food/${item.id}`)}
            onFavorite={() => handleToggleFavorite(item)}
            isFav={isFavorite(item.id)}
            loadingId={loadingId}
            onShare={handleShare}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 16, marginBottom: 2 },
  title: { fontSize: 30, fontWeight: "bold" },
  favIcon: { padding: 10, borderRadius: 12, marginTop: 4 },
  searchContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 15, height: 50 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  categoryList: { marginBottom: 15 },
  categoryButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, marginRight: 10, height: 42 },
  categoryText: { fontWeight: "600" },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, marginTop: 16 },
  emptySubtitle: { fontSize: 15, textAlign: "center", marginBottom: 25, paddingHorizontal: 30 },
  clearButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  clearButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  errorBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#d32f2f", padding: 12, borderRadius: 10, marginBottom: 15, gap: 8 },
  errorBannerContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  errorBannerText: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "500" },
  retryBtn: { color: "#fff", fontSize: 13, fontWeight: "bold", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#fff", overflow: "hidden" },
  cardWrapper: { marginBottom: 15, position: "relative" },
  card: { flexDirection: "row", backgroundColor: "#f5f5f5", borderRadius: 15, overflow: "hidden", position: "relative" },
  image: { width: 120, height: 130 },
  info: { flex: 1, padding: 12, justifyContent: "center", gap: 4 },
  name: { fontSize: 18, fontWeight: "bold" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  category: { color: "#777", fontSize: 13 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 13, fontWeight: "600" },
  price: { fontSize: 17, fontWeight: "bold", color: "#ff6b00", marginTop: 4 },
  favoriteButton: { position: "absolute", top: 10, right: 10, zIndex: 10, backgroundColor: "#fff", borderRadius: 20, padding: 6 },
  shareIcon: { position: "absolute", bottom: 10, right: 10, backgroundColor: "#fff", borderRadius: 16, padding: 6, zIndex: 10 },
  aiSection: { marginBottom: 15 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  aiTitle: { fontSize: 17, fontWeight: "bold" },
  aiCard: { width: 130, borderRadius: 12, padding: 8, marginRight: 12 },
  aiImage: { width: 114, height: 80, borderRadius: 8, marginBottom: 6 },
  aiItemName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  aiPrice: { fontSize: 13, fontWeight: "bold", color: "#ff6b00" },
});
