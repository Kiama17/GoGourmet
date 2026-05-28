import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../styles/colors";

export default function SuccessScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="checkmark-circle" size={100} color={COLORS.success} />
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: "center", width: "100%" }}>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.message}>
          Your order has been received and is being prepared.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            You'll receive an SMS confirmation shortly. Track your order status in the Orders tab.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(tabs)/orders")}
        >
          <Ionicons name="receipt-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.text} />
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  iconWrapper: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  message: {
    fontSize: 17,
    textAlign: "center",
    color: COLORS.subText,
    lineHeight: 26,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff6e5",
    padding: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 32,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  secondaryButtonText: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
});
