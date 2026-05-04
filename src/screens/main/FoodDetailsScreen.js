import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FoodDetailsScreen({ route, navigation }) {
  const { food } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: food.image }} style={styles.image} />

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{food.name}</Text>

        <Text style={styles.price}>KSh {food.price}</Text>

        <Text style={styles.description}>
          Delicious freshly prepared meal delivered hot to your doorstep.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.buttonText}>Add To Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  image: {
    width: "100%",
    height: 300,
  },

  infoContainer: {
    padding: 20,
  },

  name: {
    fontSize: 28,
    fontWeight: "bold",
  },

  price: {
    fontSize: 22,
    color: "#00C853",
    marginTop: 10,
    fontWeight: "600",
  },

  description: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },

  button: {
    backgroundColor: "#FF6D00",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
