import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../styles/colors";

import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { useFavorites } from "../context/FavoritesContext";

export default function FavoritesScreen() {
  const { favorites, removeFavorite, loading, error, clearError } =
    useFavorites();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return <ErrorMessage message={error} onDismiss={clearError} />;
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/food/${item.id}`)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>KES {item.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFavorite(item.id)}
            >
              <Ionicons name="heart" size={26} color={COLORS.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 30,
  },
  headerRow: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.subText },
  errorTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, marginTop: 16 },
  errorSubtitle: {
    fontSize: 15,
    color: COLORS.subText,
    textAlign: "center",
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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
  price: { marginTop: 6, fontSize: 16, color: COLORS.primary, fontWeight: "600" },
  removeButton: { padding: 15 },
});