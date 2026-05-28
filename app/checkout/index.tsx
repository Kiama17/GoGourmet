import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import LoadingSpinner from "../../components/LoadingSpinner";
import PaymentMethodSelector, { PaymentMethod } from "../../components/PaymentMethodSelector";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrdersContext";

export default function CheckoutScreen() {
  const { pickedAddress, pickedLat, pickedLng } = useLocalSearchParams<{
    pickedAddress?: string;
    pickedLat?: string;
    pickedLng?: string;
  }>();
  const { cartItems, totalPrice, loading: cartLoading } = useCart();
  const { placeOrder, loading: orderLoading } = useOrders();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(pickedAddress || "");
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pickedAddress) setAddress(pickedAddress);
    if (pickedLat && pickedLng) setPickedCoords({ lat: parseFloat(pickedLat), lng: parseFloat(pickedLng) });
  }, [pickedAddress, pickedLat, pickedLng]);

  const deliveryFee = totalPrice >= 1000 ? 0 : 150;
  const grandTotal = totalPrice + deliveryFee;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^0\d{9}$/.test(phone.trim()))
      newErrors.phone = "Enter a valid 10-digit phone number";
    if (!address.trim()) newErrors.address = "Delivery address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    if (paymentMethod === "mpesa") {
      router.push({
        pathname: "/checkout/payment",
        params: { phone: phone.trim(), amount: String(grandTotal), name: name.trim(), address: address.trim() },
      });
      return;
    }

    try {
      await placeOrder({ address, phone });
      router.replace("/checkout/success");
    } catch {
      Alert.alert("Error", "Failed to place order. Please try again.");
    }
  };

  if (cartLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="cart-outline" size={60} color="#ddd" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text style={styles.shopButtonText}>Browse Food</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Checkout</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="Enter your full name"
          value={name}
          onChangeText={(t) => { setName(t); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }}
          style={[styles.input, errors.name && styles.inputError]}
          placeholderTextColor="#999"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="0712345678"
          value={phone}
          onChangeText={(t) => { setPhone(t); if (errors.phone) setErrors((p) => ({ ...p, phone: "" })); }}
          keyboardType="phone-pad"
          style={[styles.input, errors.phone && styles.inputError]}
          placeholderTextColor="#999"
          maxLength={10}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>Delivery Address</Text>
        <View style={styles.addressRow}>
          <TextInput
            placeholder="Enter your delivery address"
            value={address}
            onChangeText={(t) => { setAddress(t); if (errors.address) setErrors((p) => ({ ...p, address: "" })); }}
            multiline
            style={[styles.input, styles.addressInput, errors.address && styles.inputError, { flex: 1 }]}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => router.push({ pathname: "/address-picker", params: { returnTo: "/checkout" } })}
          >
            <Ionicons name="map-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        {pickedCoords && (
          <Text style={styles.coordsHint}>
            <Ionicons name="navigate" size={12} color={COLORS.success} /> Location pinned
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryItemText}>
              {item.name} x{item.quantity}
            </Text>
            <Text style={styles.summaryItemPrice}>
              KES {item.price * item.quantity}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>
            {deliveryFee === 0 ? (
              <Text style={styles.freeBadge}>FREE</Text>
            ) : (
              `KES ${deliveryFee}`
            )}
          </Text>
        </View>
        {deliveryFee > 0 && (
          <Text style={styles.freeHint}>
            Add KES {1000 - totalPrice} more for free delivery
          </Text>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>KES {grandTotal}</Text>
        </View>
      </View>

      <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} total={grandTotal} />

      <TouchableOpacity
        style={[styles.button, orderLoading && styles.buttonDisabled]}
        onPress={handlePlaceOrder}
        disabled={orderLoading}
      >
        {orderLoading ? (
          <LoadingSpinner size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>{paymentMethod === "mpesa" ? "Pay with M-Pesa" : "Place Order"}</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.subText },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  shopButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 24, marginTop: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  inputError: { borderWidth: 1.5, borderColor: COLORS.danger },
  addressInput: { height: 100, textAlignVertical: "top" },
  addressRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  mapButton: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  coordsHint: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: { color: COLORS.danger, fontSize: 13, marginTop: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryItemText: { fontSize: 15, flex: 1 },
  summaryItemPrice: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  summaryLabel: { fontSize: 16, color: COLORS.subText },
  summaryValue: { fontSize: 16, fontWeight: "500" },
  freeBadge: { color: COLORS.success, fontWeight: "bold" },
  freeHint: { fontSize: 13, color: COLORS.success, marginTop: 4 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  total: { fontSize: 24, fontWeight: "bold", color: COLORS.primary },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  bottomSpacer: { height: 40 },
});