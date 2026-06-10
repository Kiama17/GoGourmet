import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import PaymentMethodSelector, { PaymentMethod } from "../../components/PaymentMethodSelector";
import { deliveryFeeFromCoords } from "../../utils/location";
import { useAddresses, SavedAddress } from "../../context/AddressContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrdersContext";
import { analytics } from "../../services/analytics";

const LABELS = ["Home", "Work", "Office", "Gym"];
const FORM_KEY = "gogourmet_checkout_form";

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    pickedAddress?: string;
    pickedLat?: string;
    pickedLng?: string;
    returnName?: string;
    returnPhone?: string;
    returnPayment?: string;
  }>();
  const { cartItems, totalPrice, loading: cartLoading } = useCart();
  const { placeOrder, loading: orderLoading } = useOrders();
  const { addresses, fetchAddresses, saveAddress } = useAddresses();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Home");
  const [ready, setReady] = useState(false);
  const savedNewRef = useRef(false);
  const pickedAddressRef = useRef("");

  useEffect(() => {
    AsyncStorage.getItem(FORM_KEY).then((saved) => {
      if (saved) {
        try {
          const f = JSON.parse(saved);
          setName(params.returnName || f.name || "");
          setPhone(params.returnPhone || f.phone || "");
          setPaymentMethod((params.returnPayment as PaymentMethod) || f.paymentMethod || "cod");
        } catch {}
      } else {
        setName(params.returnName || "");
        setPhone(params.returnPhone || "");
        setPaymentMethod((params.returnPayment as PaymentMethod) || "cod");
      }
      if (params.pickedAddress) pickedAddressRef.current = params.pickedAddress;
      setAddress(params.pickedAddress || "");
      if (params.pickedLat && params.pickedLng) {
        setPickedCoords({ lat: parseFloat(params.pickedLat), lng: parseFloat(params.pickedLng) });
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(FORM_KEY, JSON.stringify({ name, phone, paymentMethod }));
  }, [name, phone, paymentMethod, ready]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (params.pickedAddress) { pickedAddressRef.current = params.pickedAddress; setAddress(params.pickedAddress); }
    if (params.pickedLat && params.pickedLng) {
      const coords = { lat: parseFloat(params.pickedLat), lng: parseFloat(params.pickedLng) };
      setPickedCoords(coords);
      if (!savedNewRef.current && addresses.length > 0) {
        const alreadySaved = addresses.some(
          (a) => a.address === params.pickedAddress || (Math.abs(a.latitude - coords.lat) < 0.001 && Math.abs(a.longitude - coords.lng) < 0.001),
        );
        if (!alreadySaved) setShowSavePrompt(true);
      }
      savedNewRef.current = false;
    }
    if (params.returnName) setName(params.returnName);
    if (params.returnPhone) setPhone(params.returnPhone);
    if (params.returnPayment) setPaymentMethod(params.returnPayment as PaymentMethod);
  }, [ready, params.pickedAddress, params.pickedLat, params.pickedLng, params.returnName, params.returnPhone, params.returnPayment]);

  const { fee: deliveryFee, km } = deliveryFeeFromCoords(pickedCoords?.lat, pickedCoords?.lng);
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

  const handleSelectSaved = useCallback((a: SavedAddress) => {
    setAddress(a.address);
    setPickedCoords({ lat: a.latitude, lng: a.longitude });
    if (errors.address) setErrors((p) => ({ ...p, address: "" }));
  }, []);

  const handleSaveAddress = async () => {
    if (!pickedCoords || !pickedAddressRef.current) return;
    try {
      await saveAddress({
        label: selectedLabel,
        address: pickedAddressRef.current,
        latitude: pickedCoords.lat,
        longitude: pickedCoords.lng,
        is_default: addresses.length === 0,
      });
      setShowSavePrompt(false);
    } catch {
      showToast("Failed to save address", "error");
    }
  };

  const clearForm = () => {
    AsyncStorage.removeItem(FORM_KEY);
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    if (paymentMethod === "mpesa") {
      analytics.track("payment_initiated", { amount: grandTotal });
      router.push({
        pathname: "/checkout/payment",
        params: { phone: phone.trim(), amount: String(grandTotal), name: name.trim(), address: address.trim() },
      });
      return;
    }

    try {
      analytics.track("payment_initiated", { amount: grandTotal });
      const orderId = await placeOrder({ address, phone });
      analytics.track("payment_success", { order_id: orderId ?? "" });
      clearForm();
      router.replace("/checkout/success");
    } catch (err) {
      analytics.track("payment_failed", { error: (err as Error).message });
      showToast("Failed to place order. Please try again.", "error");
    }
  };

  const goToPicker = () => {
    savedNewRef.current = true;
    router.push({
      pathname: "/address-picker",
      params: { returnTo: "/checkout", returnName: name, returnPhone: phone, returnPayment: paymentMethod },
    });
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
          accessibilityLabel="Browse Food"
          accessibilityRole="button"
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

        {addresses.length > 0 && (
          <View style={styles.savedList}>
            {addresses.slice(0, 5).map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.savedCard, a.address === address && styles.savedCardActive]}
                onPress={() => handleSelectSaved(a)}
                accessibilityLabel={`Select address: ${a.label}`}
                accessibilityRole="button"
              >
                <View style={styles.savedCardLeft}>
                  <Ionicons name="location-outline" size={16} color={a.address === address ? COLORS.primary : COLORS.subText} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.savedLabel, a.address === address && { color: COLORS.primary }]}>
                      {a.label}{a.is_default ? " (Default)" : ""}
                    </Text>
                    <Text style={styles.savedAddress} numberOfLines={1}>{a.address}</Text>
                  </View>
                </View>
                {a.address === address && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.addressRow}>
          <TextInput
            placeholder="Enter your delivery address"
            value={address}
            onChangeText={(t) => { setAddress(t); if (errors.address) setErrors((p) => ({ ...p, address: "" })); }}
            multiline
            style={[styles.input, styles.addressInput, errors.address && styles.inputError, { flex: 1 }]}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.mapButton} onPress={goToPicker} accessibilityLabel="Pick on map" accessibilityRole="button">
            <Ionicons name="map-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        {pickedCoords && !showSavePrompt && (
          <Text style={styles.coordsHint}>
            <Ionicons name="navigate" size={12} color={COLORS.success} /> Location pinned
          </Text>
        )}

        {showSavePrompt && (
          <View style={styles.savePrompt}>
            <Text style={styles.savePromptTitle}>Save this address?</Text>
            <View style={styles.labelRow}>
              {LABELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelChip, selectedLabel === l && styles.labelChipActive]}
                  onPress={() => setSelectedLabel(l)}
                  accessibilityLabel={`Label: ${l}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.labelChipText, selectedLabel === l && styles.labelChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.saveActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress} accessibilityLabel="Save address" accessibilityRole="button">
                <Ionicons name="bookmark-outline" size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSavePrompt(false)} accessibilityLabel="Skip saving address" accessibilityRole="button">
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
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
          <Text style={styles.summaryLabel}>
            Delivery Fee{km > 0 ? ` (${km} km)` : ""}
          </Text>
          <Text style={styles.summaryValue}>
            {deliveryFee === 0 ? <Text style={styles.freeBadge}>FREE</Text> : `KES ${deliveryFee}`}
          </Text>
        </View>
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
        accessibilityLabel={paymentMethod === "mpesa" ? "Pay with M-Pesa" : "Place order"}
        accessibilityRole="button"
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.subText },
  shopButton: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  shopButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 24, marginTop: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, fontSize: 16 },
  inputError: { borderWidth: 1.5, borderColor: COLORS.danger },
  addressInput: { height: 100, textAlignVertical: "top" },
  addressRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  mapButton: { backgroundColor: COLORS.card, padding: 12, borderRadius: 12, marginTop: 6 },
  coordsHint: { fontSize: 12, color: COLORS.success, marginTop: 4, flexDirection: "row", alignItems: "center" },
  errorText: { color: COLORS.danger, fontSize: 13, marginTop: 4 },
  savedList: { marginBottom: 12, gap: 8 },
  savedCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card,
    borderRadius: 12, padding: 12, gap: 8,
  },
  savedCardActive: { borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: "#fff6ed" },
  savedCardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  savedLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  savedAddress: { fontSize: 12, color: COLORS.subText, marginTop: 1 },
  savePrompt: {
    backgroundColor: "#fff6ed", borderRadius: 14, padding: 16, marginTop: 12,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  savePromptTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  labelRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  labelChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: "#fff" },
  labelChipActive: { backgroundColor: COLORS.primary },
  labelChipText: { fontSize: 13, color: COLORS.text },
  labelChipTextActive: { color: "#fff", fontWeight: "600" },
  saveActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  saveButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
  },
  saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  skipText: { fontSize: 14, color: COLORS.subText },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryItemText: { fontSize: 15, flex: 1 },
  summaryItemPrice: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  summaryLabel: { fontSize: 16, color: COLORS.subText },
  summaryValue: { fontSize: 16, fontWeight: "500" },
  freeBadge: { color: COLORS.success, fontWeight: "bold" },
  freeHint: { fontSize: 13, color: COLORS.success, marginTop: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  total: { fontSize: 24, fontWeight: "bold", color: COLORS.primary },
  button: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    backgroundColor: COLORS.primary, padding: 18, borderRadius: 14, marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  bottomSpacer: { height: 40 },
});
