import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const CATEGORIES = [
  { id: "1", name: "Burgers", icon: "🍔" },
  { id: "2", name: "Pizza", icon: "🍕" },
  { id: "3", name: "Local", icon: "🍲" },
  { id: "4", name: "Drinks", icon: "🥤" },
];

const RESTAURANTS = [
  {
    id: "1",
    name: "Meru Grill House",
    image: "https://via.placeholder.com/150", // Replace with local image
    rating: 4.8,
    time: "15-20 min",
    fee: "Ksh 100",
  },
  {
    id: "2",
    name: "Skyward Pizza",
    image: "https://via.placeholder.com/150",
    rating: 4.5,
    time: "25-30 min",
    fee: "Free",
  },
];

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for food in Meru..."
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.categoryCard}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Restaurant List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
          {RESTAURANTS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.restaurantCard}>
              <Image source={{ uri: item.image }} style={styles.resImage} />
              <View style={styles.resDetails}>
                <Text style={styles.resName}>{item.name}</Text>
                <Text style={styles.resInfo}>
                  {item.rating} ⭐ • {item.time} • {item.fee}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 15, paddingTop: 50 },
  searchBar: {
    backgroundColor: "#F3F3F3",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  section: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  categoryCard: {
    alignItems: "center",
    marginRight: 20,
    padding: 10,
    backgroundColor: "#FFF5F0",
    borderRadius: 10,
  },
  restaurantCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  resImage: { width: "100%", height: 150 },
  resDetails: { padding: 10 },
  resName: { fontSize: 16, fontWeight: "bold" },
  resInfo: { color: "gray", marginTop: 5 },
});

export default HomeScreen;
