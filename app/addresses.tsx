import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS } from "../styles/colors";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { SavedAddress, useAddresses } from "../context/AddressContext";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  defaultCard: { borderColor: COLORS.primary },
  cardHeader: { marginBottom: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 16, fontWeight: "bold" },
  defaultBadge: {
    backgroundColor: COLORS.primary + "20",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  defaultText: { fontSize: 11, color: COLORS.primary, fontWeight: "600" },
  address: { fontSize: 14, color: COLORS.subText, lineHeight: 20, marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 16, marginTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 13, color: COLORS.primary, fontWeight: "500" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold" },
  modalBody: { paddingVertical: 12 },
  modalSubtitle: { fontSize: 14, color: COLORS.subText, marginBottom: 16 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  tagButtonActive: { backgroundColor: COLORS.primary },
  tagText: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  tagTextActive: { color: "#fff" },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  addressLabel: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  addressPreviewContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  addressPreviewIcon: { marginTop: 2 },
  addressPreviewText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchLabel: { fontSize: 16, fontWeight: "600" },
  switchSubtitle: { fontSize: 13, color: COLORS.subText, marginTop: 2 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: "center" },
  modalCancelBtn: { backgroundColor: COLORS.card },
  modalCancelBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  modalSaveBtn: { backgroundColor: COLORS.primary },
  modalSaveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalBtnDisabled: { opacity: 0.5 },
});

const AddressCard = ({ item, onSetDefault, onDelete }: {
  item: SavedAddress;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <View style={[styles.card, item.is_default && styles.defaultCard]}>
    <View style={styles.cardHeader}>
      <View style={styles.labelRow}>
        <Ionicons name="location" size={18} color={COLORS.primary} />
        <Text style={styles.label}>{item.label}</Text>
        {item.is_default && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
    </View>
    <Text style={styles.address}>{item.address}</Text>
    <View style={styles.cardActions}>
      {!item.is_default && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onSetDefault(item.id)}>
          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.actionText}>Set Default</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function AddressesScreen() {
  const { addresses, loading, setDefault, deleteAddress, saveAddress } = useAddresses();
  const router = useRouter();
  const { pickedAddress, pickedLat, pickedLng } = useLocalSearchParams<{
    pickedAddress?: string;
    pickedLat?: string;
    pickedLng?: string;
  }>();

  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState("Home");
  const [isDefault, setIsDefault] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ Fix 1: Track whether we've already handled this set of params
  const handledParamsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pickedAddress || !pickedLat || !pickedLng) return;

    // ✅ Fix 2: Build a unique key so this only fires once per navigation event
    const paramsKey = `${pickedAddress}|${pickedLat}|${pickedLng}`;
    if (handledParamsRef.current === paramsKey) return;
    handledParamsRef.current = paramsKey;

    // ✅ Fix 3: Validate coordinates before using them
    const lat = parseFloat(pickedLat);
    const lng = parseFloat(pickedLng);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert("Error", "Invalid location coordinates. Please try again.");
      router.replace("/addresses");
      return;
    }

    setPendingAddress({ address: pickedAddress, latitude: lat, longitude: lng });
    setLabel("Home");
    setIsDefault(addresses.length === 0);
    setModalVisible(true);

    // ✅ Fix 4: Defer the replace so params are consumed before clearing
    setTimeout(() => router.replace("/addresses"), 300);
  }, [pickedAddress, pickedLat, pickedLng]); // ✅ Removed addresses.length and router

  const handleSetDefault = useCallback(async (id: string) => {
    try {
      await setDefault(id);
    } catch {
      Alert.alert("Error", "Failed to set default address");
    }
  }, [setDefault]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // ✅ Fix 5: Await and catch delete errors
          try {
            await deleteAddress(id);
          } catch {
            Alert.alert("Error", "Failed to delete address. Please try again.");
          }
        },
      },
    ]);
  }, [deleteAddress]);

  const handleSaveAddress = async () => {
    if (!pendingAddress) return;
    if (!label.trim()) {
      Alert.alert("Validation Error", "Please enter a label for this address.");
      return;
    }
    setSaving(true);
    try {
      await saveAddress({
        label: label.trim(),
        address: pendingAddress.address,
        latitude: pendingAddress.latitude,
        longitude: pendingAddress.longitude,
        is_default: isDefault,
      });
      setModalVisible(false);
      setPendingAddress(null);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setPendingAddress(null);
  };

  if (loading && !modalVisible) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Addresses</Text>

      {addresses.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title="No saved addresses"
          subtitle="Add your first delivery address"
        />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AddressCard item={item} onSetDefault={handleSetDefault} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push({ pathname: "/address-picker", params: { returnTo: "/addresses" } })}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addText}>Add New Address</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Address</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalSubtitle}>Give this address a label to find it easily</Text>

              <View style={styles.tagContainer}>
                {["Home", "Work", "Office", "Gym"].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagButton, label === tag && styles.tagButtonActive]}
                    onPress={() => setLabel(tag)}
                  >
                    <Text style={[styles.tagText, label === tag && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Or type a custom label..."
                placeholderTextColor="#999"
                value={label}
                onChangeText={setLabel}
                maxLength={20}
              />

              <Text style={styles.addressLabel}>Selected Location</Text>
              <View style={styles.addressPreviewContainer}>
                <Ionicons name="map-outline" size={18} color={COLORS.primary} style={styles.addressPreviewIcon} />
                {/* ✅ Fix 6: Fallback if address is missing */}
                <Text style={styles.addressPreviewText}>
                  {pendingAddress?.address || "No address selected"}
                </Text>
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.switchLabel}>Set as Default</Text>
                  <Text style={styles.switchSubtitle}>Use this address as your primary delivery option</Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: "#ddd", true: COLORS.secondary }}
                  thumbColor={isDefault ? COLORS.primary : "#f4f3f4"}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn, saving && styles.modalBtnDisabled]}
                onPress={handleSaveAddress}
                disabled={saving}
              >
                <Text style={styles.modalSaveBtnText}>
                  {saving ? "Saving..." : "Save Address"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}