import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CartScreen({ route, navigation }) {
  // Temporary sample item
  const cartItem = {
    name: "Burger Deluxe",
    price: 450,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
  };

  const deliveryFee = 150;

  const total = cartItem.price + deliveryFee;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cart</Text>

      <View style={styles.card}>
        <Image source={{ uri: cartItem.image }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.foodName}>{cartItem.name}</Text>

          <Text style={styles.price}>KSh {cartItem.price}</Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.row}>
          <Text>Food Total</Text>
          <Text>KSh {cartItem.price}</Text>
        </View>

        <View style={styles.row}>
          <Text>Delivery Fee</Text>
          <Text>KSh {deliveryFee}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalText}>Total</Text>

          <Text style={styles.totalText}>KSh {total}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Checkout")}
      >
        <Text style={styles.buttonText}>Proceed To Checkout</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 10,
    marginBottom: 30,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  info: {
    marginLeft: 15,
    justifyContent: "center",
  },

  foodName: {
    fontSize: 20,
    fontWeight: "bold",
  },

  price: {
    marginTop: 10,
    fontSize: 18,
    color: "#00C853",
  },

  summary: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#fafafa",
    borderRadius: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  totalText: {
    fontWeight: "bold",
    fontSize: 18,
  },

  button: {
    backgroundColor: "#FF6D00",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
