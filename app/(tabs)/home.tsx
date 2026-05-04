import React from "react";
import { StyleSheet, Text, View } from "react-native";

// You MUST have 'export default' here
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GoGourmet</Text>
      <Text style={styles.subtitle}>Fresh food delivered to your door</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E67E22", // GoGourmet Orange
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
});
