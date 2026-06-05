import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useOrders } from "../../context/OrdersContext";
import {
  checkMpesaStatus,
  initiateMpesaPayment,
} from "../../services/mpesa";

type PaymentStage = "sending" | "pin" | "processing" | "success" | "failed";

export default function PaymentScreen() {
  const { phone, amount, name, address } = useLocalSearchParams<{
    phone: string;
    amount: string;
    name: string;
    address: string;
  }>();
  const { placeOrder } = useOrders();
  const [stage, setStage] = useState<PaymentStage>("sending");
  const [errorMsg, setErrorMsg] = useState("");
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    initPayment();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [stage]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const initPayment = async () => {
    try {
      setStage("sending");
      const result = await initiateMpesaPayment({
        phone: phone || "0712345678",
        amount: parseInt(amount || "0", 10),
        accountReference: "GoGourmet",
        transactionDesc: "Food Order Payment",
      });

      if (!result.success || !result.checkoutRequestID) {
        setStage("failed");
        setErrorMsg(result.message || "Failed to initiate payment");
        return;
      }

      setStage("pin");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStage("processing");
      const status = await checkMpesaStatus(result.checkoutRequestID);

      if (status.success) {
        setStage("success");
        await placeOrder({ phone, address });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.replace("/checkout/success");
      } else {
        setStage("failed");
        setErrorMsg(status.message || "Payment was not completed");
      }
    } catch {
      setStage("failed");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {stage === "sending" && (
          <>
            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
              <Ionicons name="sync" size={64} color={COLORS.primary} />
            </Animated.View>
            <Text style={styles.title}>Sending Request</Text>
            <Text style={styles.subtitle}>
              Initiating M-Pesa STK Push to {phone}
            </Text>
            <Text style={styles.amount}>KES {amount}</Text>
          </>
        )}

        {stage === "pin" && (
          <>
            <View style={styles.iconWrapper}>
              <Ionicons name="phone-portrait-outline" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Check Your Phone</Text>
            <Text style={styles.subtitle}>
              Enter your M-Pesa PIN on the STK Push prompt sent to {phone}
            </Text>
            <LoadingSpinner size="small" />
            <Text style={styles.hint}>Waiting for confirmation...</Text>
          </>
        )}

        {stage === "processing" && (
          <>
            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
              <Ionicons name="sync" size={64} color={COLORS.primary} />
            </Animated.View>
            <Text style={styles.title}>Processing Payment</Text>
            <Text style={styles.subtitle}>
              Please wait while we confirm your payment
            </Text>
          </>
        )}

        {stage === "success" && (
          <>
            <View style={[styles.iconWrapper, styles.successIcon]}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
            </View>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>Redirecting to order details...</Text>
          </>
        )}

        {stage === "failed" && (
          <>
            <View style={[styles.iconWrapper, styles.failedIcon]}>
              <Ionicons name="close-circle" size={80} color={COLORS.danger} />
            </View>
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={initPayment}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
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
  content: { alignItems: "center", width: "100%" },
  spinner: { marginBottom: 24 },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successIcon: { backgroundColor: "#e8f5e9" },
  failedIcon: { backgroundColor: "#ffebee" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.subText,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 12,
  },
  hint: {
    fontSize: 14,
    color: COLORS.subText,
    marginTop: 12,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 15,
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  retryButtonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: { color: COLORS.subText, fontSize: 16, fontWeight: "500" },
});
