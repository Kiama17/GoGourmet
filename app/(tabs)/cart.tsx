import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const cartItems = [
  {
    id: "1",
    name: "Burger",
    price: 500,
    quantity: 2,
    image: require("../../assets/images/burger.png"),
  },

  {
    id: "2",
    name: "Pizza",
    price: 1200,
    quantity: 1,
    image: require("../../assets/images/pizza.png"),
  },
];

export default function CartScreen() {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cart</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.price}>Ksh {item.price}</Text>

              <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: Ksh {total}</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
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
    padding: 12,
    marginBottom: 15,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  info: {
    marginLeft: 15,
    justifyContent: "center",
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  price: {
    fontSize: 16,
    color: "#ff6b00",
    marginTop: 5,
  },

  quantity: {
    marginTop: 5,
    fontSize: 15,
  },

  footer: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 20,
    marginTop: 10,
  },

  total: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#ff6b00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
