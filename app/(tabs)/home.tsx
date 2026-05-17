import React, { useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { foods } from "../../data/foods";

import useFavorites from "../../context/FavoritesContext";

const categories = [
  "All",
  "Burger",
  "Pizza",
  "Wraps",
  "Drinks",
  "Fries",
];

export default function HomeScreen({
  navigation,
}: any) {
  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const {
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  const filteredFoods = foods.filter(
    (food) => {
      const matchesSearch =
        food.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        selectedCategory === "All"
          ? true
          : food.category ===
            selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <Text style={styles.title}>
        Food Delivery
      </Text>

      {/* SEARCH */}

      <TextInput
        placeholder="Search food..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* CATEGORIES */}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        data={categories}
        keyExtractor={(item) => item}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,

              selectedCategory ===
                item &&
                styles.activeCategory,
            ]}
            onPress={() =>
              setSelectedCategory(
                item
              )
            }
          >
            <Text
              style={[
                styles.categoryText,

                selectedCategory ===
                  item &&
                  styles.activeCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* FOOD LIST */}

      <FlatList
        data={filteredFoods}
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                "FoodDetails",
                {
                  food: item,
                }
              )
            }
          >
            {/* FAVORITE BUTTON */}

            <TouchableOpacity
              style={
                styles.favoriteButton
              }
              onPress={() =>
                toggleFavorite(item)
              }
            >
              <Ionicons
                name={
                  isFavorite(item.id)
                    ? "heart"
                    : "heart-outline"
                }
                size={24}
                color="red"
              />
            </TouchableOpacity>

            {/* IMAGE */}

            <Image
              source={{
                uri: item.image,
              }}
              style={styles.image}
            />

            {/* INFO */}

            <View style={styles.info}>
              <Text
                style={styles.name}
              >
                {item.name}
              </Text>

              <Text
                style={
                  styles.category
                }
              >
                {item.category}
              </Text>

              <Text
                style={styles.price}
              >
                KES {item.price}
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
    marginBottom: 20,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  categoryList: {
    marginBottom: 15,
  },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    marginRight: 10,
    height: 42,
  },

  activeCategory: {
    backgroundColor: "#000",
  },

  categoryText: {
    color: "#000",
    fontWeight: "600",
  },

  activeCategoryText: {
    color: "#fff",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },

  image: {
    width: 120,
    height: 120,
  },

  info: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  category: {
    marginTop: 4,
    color: "#666",
  },

  price: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
  },

  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
  },
});