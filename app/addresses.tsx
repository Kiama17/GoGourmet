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

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { SavedAddress, useAddresses } from "../context/AddressContext";
import { useApp } from "../hooks/useApp";
import { sanitize } from "../utils/sanitize";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardHeader: { marginBottom: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 16, fontWeight: "bold" },
  defaultBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  defaultText: { fontSize: 11, fontWeight: "600" },
  address: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 16, marginTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 13, fontWeight: "500" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
  modalSubtitle: { fontSize: 14, marginBottom: 16 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  tagText: { fontSize: 14, fontWeight: "500" },
  tagTextActive: { color: "#fff" },
  modalInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  addressLabel: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  addressPreviewContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  addressPreviewIcon: { marginTop: 2 },
  addressPreviewText: { flex: 1, fontSize: 14, lineHeight: 20 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchLabel: { fontSize: 16, fontWeight: "600" },
  switchSubtitle: { fontSize: 13, marginTop: 2 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: "center" },
  modalCancelBtnText: { fontSize: 16, fontWeight: "600" },
  modalSaveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalBtnDisabled: { opacity: 0.5 },
});

const AddressCard = ({ item, onSetDefault, onDelete, colors }: {
  item: SavedAddress;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  colors: any;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card }, item.is_default && { borderColor: colors.primary }]}>
    <View style={styles.cardHeader}>
      <View style={styles.labelRow}>
        <Ionicons name="location" size={18} color={colors.primary} />
        <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
        {item.is_default && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
          </View>
        )}
      </View>
    </View>
    <Text style={[styles.address, { color: colors.subText }]}>{item.address}</Text>
    <View style={styles.cardActions}>
      {!item.is_default && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onSetDefault(item.id)}>
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Set Default</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
        <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function AddressesScreen() {
  const { addresses, loading, setDefault, deleteAddress, saveAddress } = useAddresses();
  const { colors, t } = useApp();
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
      Alert.alert(t("common.error"), "Invalid location coordinates. Please try again.");
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
      Alert.alert(t("common.error"), t("common.retry"));
    }
  }, [setDefault]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id);
          } catch {
            Alert.alert(t("common.error"), t("common.retry"));
          }
        },
      },
    ]);
  }, [deleteAddress, t]);

  const handleSaveAddress = async () => {
    if (!pendingAddress) return;
    if (!label.trim()) {
      Alert.alert(t("common.error"), t("common.retry"));
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
      Alert.alert(t("common.error"), err.message || t("common.retry"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setPendingAddress(null);
  };

  if (loading && !modalVisible) return <LoadingSpinner fullScreen skeleton="addresses" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("address.title")}</Text>

      {addresses.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title={t("address.empty")}
          subtitle={t("address.emptySubtitle")}
        />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AddressCard item={item} onSetDefault={handleSetDefault} onDelete={handleDelete} colors={colors} />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push({ pathname: "/address-picker", params: { returnTo: "/addresses" } })}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addText}>{t("address.title")}</Text>
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
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Save Address</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalSubtitle, { color: colors.subText }]}>Give this address a label to find it easily</Text>

              <View style={styles.tagContainer}>
                {[t("address.home"), t("address.work"), t("address.office"), t("address.gym")].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagButton, { backgroundColor: colors.card }, label === tag && { backgroundColor: colors.primary }]}
                    onPress={() => setLabel(tag)}
                  >
                    <Text style={[styles.tagText, { color: colors.text }, label === tag && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="Or type a custom label..."
                placeholderTextColor={colors.subText}
                value={label}
                onChangeText={(v) => setLabel(sanitize(v))}
                maxLength={20}
              />

              <Text style={[styles.addressLabel, { color: colors.text }]}>Selected Location</Text>
              <View style={[styles.addressPreviewContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="map-outline" size={18} color={colors.primary} style={styles.addressPreviewIcon} />
                <Text style={[styles.addressPreviewText, { color: colors.text }]}>
                  {pendingAddress?.address || t("common.noAddressSelected")}
                </Text>
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Set as Default</Text>
                  <Text style={[styles.switchSubtitle, { color: colors.subText }]}>Use this address as your primary delivery option</Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: "#ddd", true: colors.secondary }}
                  thumbColor={isDefault ? colors.primary : "#f4f3f4"}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.card }]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }, saving && styles.modalBtnDisabled]}
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