import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../hooks/useApp";
import { pickImage, uploadAvatar } from "../services/upload";
import { sanitize } from "../utils/sanitize";

export default function EditProfileScreen() {
  const { colors, t } = useApp();
  const { user, profile, updateProfile, loading } = useAuth();
  const { pickedAddress } = useLocalSearchParams<{ pickedAddress?: string }>();
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.user_metadata?.display_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(profile?.phone || user?.user_metadata?.phone || "");
  const [address, setAddress] = useState(profile?.address || user?.user_metadata?.address || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (pickedAddress) { setAddress(pickedAddress); router.replace("/edit-profile"); }
  }, [pickedAddress]);

  if (loading) return <LoadingSpinner fullScreen />;

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (!uri) return;
      setUploading(true);
      const url = await uploadAvatar(uri, user!.id);
      setAvatarUrl(url);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) { Alert.alert("Validation", "Display name is required"); return; }
    if (!email.trim()) { Alert.alert("Validation", "Email is required"); return; }
    try {
      setSaving(true);
      await updateProfile({ display_name: displayName.trim(), email: email.trim(), phone: phone.trim(), address: address.trim(), avatar_url: avatarUrl.trim() || undefined });
      Alert.alert("Success", "Profile updated", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update profile. Try again.");
    } finally { setSaving(false); }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePickImage} disabled={uploading} accessibilityLabel="Change photo" accessibilityRole="button">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              {uploading ? <LoadingSpinner size="small" color="#fff" /> : <Ionicons name="camera-outline" size={32} color="rgba(255,255,255,0.8)" />}
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.title}>{t("profile.editProfile")}</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>{t("auth.fullName")}</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={displayName} onChangeText={(v) => setDisplayName(sanitize(v))} placeholder={t("checkout.namePlaceholder")} placeholderTextColor={colors.subText} />

        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={phone} onChangeText={(v) => setPhone(sanitize(v))} placeholder={t("checkout.phonePlaceholder")} keyboardType="phone-pad" placeholderTextColor={colors.subText} maxLength={10} />

        <Text style={[styles.label, { color: colors.text }]}>Delivery Address</Text>
        <View style={styles.addressRow}>
          <TextInput style={[styles.input, styles.addressInput, { backgroundColor: colors.card, color: colors.text, flex: 1 }]} value={address} onChangeText={(v) => setAddress(sanitize(v))} placeholder="Enter your default delivery address" multiline placeholderTextColor={colors.subText} />
          <TouchableOpacity style={[styles.mapButton, { backgroundColor: colors.primary }]} onPress={() => router.push({ pathname: "/address-picker", params: { returnTo: "/edit-profile" } })}>
            <Ionicons name="map-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={email} onChangeText={(v) => setEmail(sanitize(v))} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.subText} />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? <LoadingSpinner size="small" color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: { position: "absolute", top: 60, left: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: "rgba(255,255,255,0.3)", marginBottom: 12 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  form: { padding: 20 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: { borderRadius: 12, padding: 15, fontSize: 16 },
  addressRow: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  addressInput: { height: 100, textAlignVertical: "top" },
  mapButton: { borderRadius: 12, width: 50, height: 50, justifyContent: "center", alignItems: "center", marginBottom: 1 },
  saveButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, padding: 16, borderRadius: 14, marginTop: 30 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
