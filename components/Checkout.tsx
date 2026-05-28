import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";

export default function CheckoutScreen() {
  const { cartItems, totalPrice } = useCart();
  const { placeOrder, loading } = useOrders();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const deliveryFee = 150;
  const subtotal = totalPrice;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!address || !phone) {
      Alert.alert("Missing details", "Please fill all fields");
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Add items to cart first");
      return;
    }
    try {
      await placeOrder({ address, phone });
      router.push("//order-success");
    } catch (error) {
      console.error(error);
      Alert.alert("Checkout failed", "Something went wrong");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        placeholder="Enter address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        editable={!loading}
        multiline
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        placeholder="07XXXXXXXX"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
        editable={!loading}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text>{item.name} x {item.quantity}</Text>
            <Text>KES {item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text>Subtotal</Text>
          <Text>KES {subtotal}</Text>
        </View>
        <View style={styles.row}>
          <Text>Delivery Fee</Text>
          <Text>KES {deliveryFee}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>KES {total}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  summaryTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  divider: { borderTopWidth: 1, borderColor: "#ddd", marginVertical: 10 },
  totalText: { fontSize: 18, fontWeight: "bold" },
  button: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
    marginBottom: 40,
  },
  buttonDisabled: { backgroundColor: "#666" },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "bold" },
});