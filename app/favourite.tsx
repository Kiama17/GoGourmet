import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../styles/colors";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useFavorites } from "../context/FavoritesContext";

type FavItemProps = {
  item: { id: string; name: string; price: number; image: string };
  onPress: () => void;
  onRemove: (id: string) => void;
};

const FavItemRow = memo(function FavItemRow({
  item,
  onPress,
  onRemove,
}: FavItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>KES {item.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <Ionicons name="heart" size={26} color={COLORS.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function FavoritesScreen() {
  const { favorites, removeFavorite, loading } = useFavorites();
  const router = useRouter();

  const handleRemove = useCallback(
    (id: string) => removeFavorite(id),
    [removeFavorite],
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Favorites</Text>
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          subtitle="Tap the heart on any food item to save it here"
          ctaLabel="Browse Food"
          ctaIcon="fast-food-outline"
          onCtaPress={() => router.push("/(tabs)/home")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} saved items</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        windowSize={5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        renderItem={({ item }) => (
          <FavItemRow
            item={item}
            onPress={() => router.push(`/food/${item.id}`)}
            onRemove={handleRemove}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  headerRow: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.subText },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    alignItems: "center",
  },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 12 },
  name: { fontSize: 18, fontWeight: "bold" },
  price: {
    marginTop: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  removeButton: { padding: 15 },
});
