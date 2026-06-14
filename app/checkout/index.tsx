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
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import PaymentMethodSelector, { PaymentMethod } from "../../components/PaymentMethodSelector";
import { deliveryFeeFromCoords } from "../../utils/location";
import { useAddresses, SavedAddress } from "../../context/AddressContext";
import { useCart } from "../../context/CartContext";
import { useNetwork } from "../../context/NetworkContext";
import { useOrders } from "../../context/OrdersContext";
import { useApp } from "../../hooks/useApp";
import { analytics } from "../../services/analytics";
import { calculateDiscountedTotal, incrementPromoUsage, validatePromoCode } from "../../services/promo";
import { sanitize } from "../../utils/sanitize";

const LABELS = ["Home", "Work", "Office", "Gym"];
const FORM_KEY = "gogourmet_checkout_form";

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ pickedAddress?: string; pickedLat?: string; pickedLng?: string; returnName?: string; returnPhone?: string; returnPayment?: string }>();
  const { cartItems, totalPrice, loading: cartLoading } = useCart();
  const { placeOrder, loading: orderLoading } = useOrders();
  const { addresses, fetchAddresses, saveAddress } = useAddresses();
  const { isConnected } = useNetwork();
  const { showToast } = useToast();
  const { colors, t } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Home");
  const [ready, setReady] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const savedNewRef = useRef(false);
  const pickedAddressRef = useRef("");

  useEffect(() => {
    AsyncStorage.getItem(FORM_KEY).then((saved) => {
      if (saved) {
        try { const f = JSON.parse(saved); setName(params.returnName || f.name || ""); setPhone(params.returnPhone || f.phone || ""); setAddress(params.pickedAddress || f.address || ""); setPaymentMethod((params.returnPayment as PaymentMethod) || f.paymentMethod || "cod"); } catch {}
      } else { setName(params.returnName || ""); setPhone(params.returnPhone || ""); setAddress(params.pickedAddress || ""); setPaymentMethod((params.returnPayment as PaymentMethod) || "cod"); }
      if (params.pickedAddress) pickedAddressRef.current = params.pickedAddress;
      if (params.pickedLat && params.pickedLng) setPickedCoords({ lat: parseFloat(params.pickedLat), lng: parseFloat(params.pickedLng) });
      setReady(true);
    }).catch(() => { setReady(true); });
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(FORM_KEY, JSON.stringify({ name, phone, address, paymentMethod }));
  }, [name, phone, address, paymentMethod, ready]);

  useEffect(() => { fetchAddresses(); }, []);

  useEffect(() => {
    if (!ready) return;
    if (params.pickedAddress) { pickedAddressRef.current = params.pickedAddress; setAddress(params.pickedAddress); }
    if (params.pickedLat && params.pickedLng) {
      const coords = { lat: parseFloat(params.pickedLat), lng: parseFloat(params.pickedLng) };
      setPickedCoords(coords);
      if (!savedNewRef.current && addresses.length > 0) {
        const alreadySaved = addresses.some((a) => a.address === params.pickedAddress || (Math.abs(a.latitude - coords.lat) < 0.001 && Math.abs(a.longitude - coords.lng) < 0.001));
        if (!alreadySaved) setShowSavePrompt(true);
      }
      savedNewRef.current = false;
    }
    if (params.returnName) setName(params.returnName);
    if (params.returnPhone) setPhone(params.returnPhone);
    if (params.returnPayment) setPaymentMethod(params.returnPayment as PaymentMethod);
  }, [ready, params.pickedAddress, params.pickedLat, params.pickedLng, params.returnName, params.returnPhone, params.returnPayment]);

  const { fee: deliveryFee, km } = deliveryFeeFromCoords(pickedCoords?.lat, pickedCoords?.lng);
  const subtotal = totalPrice + deliveryFee;
  const grandTotal = calculateDiscountedTotal(subtotal, promoDiscount);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t("checkout.nameRequired");
    if (!phone.trim()) newErrors.phone = t("checkout.phoneRequired");
    else if (!/^0\d{9}$/.test(phone.trim())) newErrors.phone = t("checkout.phoneInvalid");
    if (!address.trim()) newErrors.address = t("checkout.addressRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectSaved = useCallback((a: SavedAddress) => {
    setAddress(a.address); setPickedCoords({ lat: a.latitude, lng: a.longitude });
    if (errors.address) setErrors((p) => ({ ...p, address: "" }));
  }, []);

  const handleSaveAddress = async () => {
    if (!pickedCoords || !pickedAddressRef.current) return;
    try { await saveAddress({ label: selectedLabel, address: pickedAddressRef.current, latitude: pickedCoords.lat, longitude: pickedCoords.lng, is_default: addresses.length === 0 }); setShowSavePrompt(false); } catch { showToast("Failed to save address", "error"); }
  };

  const clearForm = () => { AsyncStorage.removeItem(FORM_KEY); };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true); setPromoError("");
    const result = await validatePromoCode(promoCode, subtotal);
    if (result.valid) {
      setPromoDiscount(result.discountPercent);
      setAppliedCode(promoCode.trim().toUpperCase());
      showToast(t("common.promoApplied", { discount: result.discountPercent }), "success");
    } else {
      setPromoError(result.message);
      setPromoDiscount(0);
      setAppliedCode("");
    }
    setPromoLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (!isConnected) { showToast("No internet connection. Please check your network.", "error"); return; }
    if (paymentMethod === "mpesa") {
      analytics.track("payment_initiated", { amount: grandTotal });
      router.push({ pathname: "/checkout/payment", params: { phone: phone.trim(), amount: String(grandTotal), name: name.trim(), address: address.trim() } });
      return;
    }
    try {
      analytics.track("payment_initiated", { amount: grandTotal });
      if (appliedCode) await incrementPromoUsage(appliedCode);
      const orderId = await placeOrder({ address, phone });
      analytics.track("payment_success", { order_id: orderId ?? "" });
      clearForm();
      router.replace("/checkout/success");
    } catch (err) {
      analytics.track("payment_failed", { error: (err as Error).message });
      showToast(t("checkout.orderFailed"), "error");
    }
  };

  const goToPicker = () => {
    savedNewRef.current = true;
    router.push({ pathname: "/address-picker", params: { returnTo: "/checkout", returnName: name, returnPhone: phone, returnPayment: paymentMethod } });
  };

  if (cartLoading) return <LoadingSpinner fullScreen />;

  if (cartItems.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="cart-outline" size={60} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.subText }]}>{t("cart.empty")}</Text>
        <TouchableOpacity style={[styles.shopButton, { backgroundColor: colors.primary }]} onPress={() => router.push("/(tabs)/home")} accessibilityLabel={t("cart.browse")} accessibilityRole="button">
          <Text style={styles.shopButtonText}>{t("cart.browse")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: colors.text }]}>{t("checkout.title")}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("checkout.deliveryDetails")}</Text>

        <Text style={[styles.label, { color: colors.text }]}>{t("checkout.fullName")}</Text>
        <TextInput placeholder={t("checkout.namePlaceholder")} value={name} onChangeText={(v) => { setName(sanitize(v)); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }} style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: errors.name ? colors.danger : "transparent" }, errors.name && styles.inputError]} placeholderTextColor={colors.subText} />
        {errors.name && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.name}</Text>}

        <Text style={[styles.label, { color: colors.text }]}>{t("checkout.phonePlaceholder")}</Text>
        <TextInput placeholder={t("checkout.phonePlaceholder")} value={phone} onChangeText={(v) => { setPhone(sanitize(v)); if (errors.phone) setErrors((p) => ({ ...p, phone: "" })); }} keyboardType="phone-pad" style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: errors.phone ? colors.danger : "transparent" }, errors.phone && styles.inputError]} placeholderTextColor={colors.subText} maxLength={10} />
        {errors.phone && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.phone}</Text>}

        <Text style={[styles.label, { color: colors.text }]}>{t("checkout.deliveryAddress")}</Text>

        {addresses.length > 0 && (
          <View style={styles.savedList}>
            {addresses.slice(0, 5).map((a) => (
              <TouchableOpacity key={a.id} style={[styles.savedCard, { backgroundColor: colors.card, borderColor: a.address === address ? colors.primary : "transparent" }, a.address === address && styles.savedCardActive]} onPress={() => handleSelectSaved(a)} accessibilityLabel={`Select address: ${a.label}`} accessibilityRole="button">
                <View style={styles.savedCardLeft}>
                  <Ionicons name="location-outline" size={16} color={a.address === address ? colors.primary : colors.subText} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.savedLabel, { color: colors.text }, a.address === address && { color: colors.primary }]}>{a.label}{a.is_default ? ` (${t("address.default")})` : ""}</Text>
                    <Text style={[styles.savedAddress, { color: colors.subText }]} numberOfLines={1}>{a.address}</Text>
                  </View>
                </View>
                {a.address === address && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.addressRow}>
          <TextInput placeholder={t("checkout.addressPlaceholder")} value={address} onChangeText={(v) => { setAddress(sanitize(v)); if (errors.address) setErrors((p) => ({ ...p, address: "" })); }} multiline style={[styles.input, styles.addressInput, { backgroundColor: colors.card, color: colors.text, borderColor: errors.address ? colors.danger : "transparent", flex: 1 }, errors.address && styles.inputError]} placeholderTextColor={colors.subText} />
          <TouchableOpacity style={[styles.mapButton, { backgroundColor: colors.card }]} onPress={goToPicker} accessibilityLabel="Pick on map" accessibilityRole="button">
            <Ionicons name="map-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {errors.address && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.address}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("checkout.orderSummary")}</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={[styles.summaryItemText, { color: colors.text }]}>{item.name} x{item.quantity}</Text>
            <Text style={[styles.summaryItemPrice, { color: colors.text }]}>KES {item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.subText }]}>{t("checkout.deliveryFee")}{km > 0 ? ` (${km} km)` : ""}</Text>
          <Text style={[styles.summaryValue, { color: colors.subText }]}>{deliveryFee === 0 ? <Text style={[styles.freeBadge, { color: colors.success }]}>{t("checkout.free")}</Text> : `KES ${deliveryFee}`}</Text>
        </View>

        {appliedCode && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.success }]}>Promo ({appliedCode})</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>-{promoDiscount}%</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>{t("checkout.total")}</Text>
          <Text style={[styles.total, { color: colors.primary }]}>KES {grandTotal}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>{t("common.promoCode")}</Text>
        <View style={styles.promoRow}>
          <TextInput placeholder={t("common.promoCode")} value={promoCode} onChangeText={(v) => { setPromoCode(sanitize(v)); setPromoError(""); }} autoCapitalize="characters" style={[styles.input, styles.promoInput, { backgroundColor: colors.card, color: colors.text }]} placeholderTextColor={colors.subText} />
          <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={handleApplyPromo} disabled={promoLoading || !promoCode.trim()} accessibilityLabel={t("common.apply")} accessibilityRole="button">
            {promoLoading ? <LoadingSpinner size="small" color="#fff" /> : <Text style={styles.applyButtonText}>{t("common.apply")}</Text>}
          </TouchableOpacity>
        </View>
        {promoError ? <Text style={[styles.errorText, { color: colors.danger }]}>{promoError}</Text> : null}
        {appliedCode ? <Text style={[styles.successText, { color: colors.success }]}>{t("common.promoApplied", { discount: promoDiscount })}</Text> : null}
      </View>

      <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} total={grandTotal} />

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, orderLoading && styles.buttonDisabled]} onPress={handlePlaceOrder} disabled={orderLoading} accessibilityLabel={paymentMethod === "mpesa" ? t("checkout.payMpesa") : t("checkout.placeOrder")} accessibilityRole="button">
        {orderLoading ? <LoadingSpinner size="small" color="#fff" /> : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>{paymentMethod === "mpesa" ? t("checkout.payMpesa") : t("checkout.placeOrder")}</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "bold" },
  shopButton: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  shopButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 24, marginTop: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 12, padding: 15, fontSize: 16, borderWidth: 1.5 },
  inputError: { borderWidth: 1.5 },
  addressInput: { height: 100, textAlignVertical: "top" },
  addressRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  mapButton: { padding: 12, borderRadius: 12, marginTop: 6 },
  errorText: { fontSize: 13, marginTop: 4 },
  successText: { fontSize: 13, marginTop: 4 },
  savedList: { marginBottom: 12, gap: 8 },
  savedCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, gap: 8, borderWidth: 1.5 },
  savedCardActive: {},
  savedCardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  savedLabel: { fontSize: 14, fontWeight: "600" },
  savedAddress: { fontSize: 12, marginTop: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryItemText: { fontSize: 15, flex: 1 },
  summaryItemPrice: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, marginVertical: 12 },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16, fontWeight: "500" },
  freeBadge: { fontWeight: "bold" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  total: { fontSize: 24, fontWeight: "bold" },
  promoRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  promoInput: { flex: 1, height: 50 },
  applyButton: { height: 50, borderRadius: 12, paddingHorizontal: 24, justifyContent: "center", alignItems: "center" },
  applyButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  button: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, padding: 18, borderRadius: 14, marginTop: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
