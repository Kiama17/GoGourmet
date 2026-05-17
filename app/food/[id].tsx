import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCart } from "../../context/CartContext";

const foods = [
  {
    id: "1",
    name: "Burger",
    price: 500,
    description: "A delicious beef burger with cheese and fresh vegetables.",
    image: require("../../assets/images/burger.png"),
  },

  {
    id: "2",
    name: "Pizza",
    price: 1200,
    description: "Hot cheesy pizza loaded with toppings and extra flavor.",
    image: require("../../assets/images/pizza.png"),
  },

  {
    id: "3",
    name: "Fries",
    price: 300,
    description: "Crispy golden fries served hot and fresh.",
    image: require("../../assets/images/fries.png"),
  },
];

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams();

  const { addToCart } = useCart();

  const food = foods.find((item) => item.id === id);

  if (!food) {
    return (
      <View style={styles.center}>
        <Text>Food not found</Text>
      </View>
    );
  }

  function handleAddToCart() {
    addToCart({
      id: food!.id,
      name: food!.name,
      price: food!.price,
      image: food!.image,
      quantity: 1,
    });

    router.push("/(tabs)/cart");
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={food.image} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{food.name}</Text>

        <Text style={styles.price}>Ksh {food.price}</Text>

        <Text style={styles.description}>{food.description}</Text>

        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  image: {
    width: "100%",
    height: 320,
  },

  content: {
    padding: 20,
  },

  name: {
    fontSize: 32,
    fontWeight: "bold",
  },

  price: {
    fontSize: 24,
    color: "#ff6b00",
    marginTop: 10,
  },

  description: {
    fontSize: 17,
    color: "gray",
    marginTop: 20,
    lineHeight: 28,
  },

  button: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 40,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
