import React from "react";

import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";

import useFavorites from "../context/FavoritesContext";

export default function FavoritesScreen() {
  const { favorites } =
    useFavorites();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Favorites
      </Text>

      <FlatList
        data={favorites}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.image}
            />

            <View>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text>
                KES {item.price}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
});