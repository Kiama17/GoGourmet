import { router } from "expo-router";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const foods = [
  {
    id: "1",
    name: "Burger",
    price: 500,
    image: require("../../assets/images/burger.png"),
  },

  {
    id: "2",
    name: "Pizza",
    price: 1200,
    image: require("../../assets/images/pizza.png"),
  },

  {
    id: "3",
    name: "Fries",
    price: 300,
    image: require("../../assets/images/fries.png"),
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>GoGourment</Text>

      <Text style={styles.subHeader}>What would you like to eat today?</Text>

      <TextInput placeholder="Search food..." style={styles.searchInput} />

      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/food/[id]" as any,
                params: { id: item.id },
              })
            }
          >
            <Image source={item.image} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.foodName}>{item.name}</Text>

              <Text style={styles.price}>Ksh {item.price}</Text>
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

  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
  },

  subHeader: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    marginBottom: 20,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 180,
  },

  info: {
    padding: 15,
  },

  foodName: {
    fontSize: 22,
    fontWeight: "bold",
  },

  price: {
    fontSize: 18,
    color: "#ff6b00",
    marginTop: 5,
  },
});
