import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OrderSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎉</Text>
      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.subtitle}>
        Your order is being prepared and will be delivered shortly.
      </Text>

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => router.push("/(tabs)/orders")}
      >
        <Text style={styles.trackButtonText}>Track My Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/(tabs)/home")}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 30,
  },
  icon: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 10 },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  trackButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
  },
  trackButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  homeButton: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    width: "100%",
  },
  homeButtonText: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});