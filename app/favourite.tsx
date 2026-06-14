import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { useFavorites } from "../context/FavoritesContext";
import { useApp } from "../hooks/useApp";

interface FavoriteCardProps {
  item: { id: string; name: string; price: number; image: string };
  onPress: () => void;
  onRemove: (id: string) => void;
  colors: any;
}

const FavoriteCard = memo(function FavoriteCard({ item, onPress, onRemove, colors }: FavoriteCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`View ${item.name}`}
      accessibilityRole="button"
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>KES {item.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
        accessibilityLabel={`Remove ${item.name} from favorites`}
        accessibilityRole="button"
      >
        <Ionicons name="heart" size={26} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function FavoritesScreen() {
  const { favorites, removeFavorite, loading, error, clearError } =
    useFavorites();
  const router = useRouter();
  const { colors, t } = useApp();

  if (loading) {
    return <LoadingSpinner fullScreen skeleton="favourites" />;
  }

  if (error) {
    return <ErrorMessage message={error} onDismiss={clearError} onRetry={clearError} />;
  }

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("favorites.title")}</Text>
        <EmptyState
          icon="heart-outline"
          title={t("favorites.empty")}
          subtitle={t("favorites.emptySubtitle")}
          ctaLabel={t("cart.browse")}
          ctaIcon="fast-food-outline"
          onCtaPress={() => router.push("/(tabs)/home")}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{t("favorites.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>{favorites.length} saved items</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <FavoriteCard
            item={item}
            onPress={() => router.push(`/food/${item.id}`)}
            onRemove={removeFavorite}
            colors={colors}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  headerRow: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 15 },
  errorTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, marginTop: 16 },
  errorSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  card: {
    flexDirection: "row",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    alignItems: "center",
  },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 12 },
  name: { fontSize: 18, fontWeight: "bold" },
  price: { marginTop: 6, fontSize: 16, fontWeight: "600" },
  removeButton: { padding: 15 },
});