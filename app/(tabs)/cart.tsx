// cart.tsx

import React from "react";

import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCart } from "../../context/CartContext";

export default function CartScreen() {
  const { cartItems, increaseQuantity, decreaseQuantity } = useCart();

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
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.price}>KES {item.price}</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => decreaseQuantity(item.id)}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => increaseQuantity(item.id)}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: KES {total}</Text>

        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 10,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },

  info: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  price: {
    fontSize: 16,
    marginTop: 5,
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  qtyButton: {
    backgroundColor: "#000",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },

  qtyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: "600",
  },

  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 20,
  },

  total: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  checkoutButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
  },

  checkoutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
