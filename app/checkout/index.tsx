import { router } from "expo-router";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CheckoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.label}>Full Name</Text>

      <TextInput placeholder="Enter your full name" style={styles.input} />

      <Text style={styles.label}>Phone Number</Text>

      <TextInput
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Delivery Address</Text>

      <TextInput
        placeholder="Enter delivery address"
        multiline
        style={[styles.input, styles.addressInput]}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Delivery Fee: Ksh 150</Text>

        <Text style={styles.summaryText}>Food Total: Ksh 1700</Text>

        <Text style={styles.total}>Total: Ksh 1850</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("./success")}
      >
        <Text style={styles.buttonText}>Place Order</Text>
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
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },

  addressInput: {
    height: 100,
    textAlignVertical: "top",
  },

  summary: {
    marginTop: 30,
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 14,
  },

  summaryText: {
    fontSize: 16,
    marginBottom: 10,
  },

  total: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff6b00",
    marginTop: 10,
  },

  button: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
