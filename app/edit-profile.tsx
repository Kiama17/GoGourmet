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
import { COLORS } from "../styles/colors";

import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

export default function EditProfileScreen() {
  const { user, profile, updateProfile, loading } = useAuth();
  const { pickedAddress } = useLocalSearchParams<{ pickedAddress?: string }>();
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.user_metadata?.display_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(profile?.phone || user?.user_metadata?.phone || "");
  const [address, setAddress] = useState(profile?.address || user?.user_metadata?.address || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pickedAddress) {
      setAddress(pickedAddress);
      router.replace("/edit-profile");
    }
  }, [pickedAddress]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Validation", "Display name is required");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Validation", "Email is required");
      return;
    }
    try {
      setSaving(true);
      await updateProfile({ display_name: displayName.trim(), email: email.trim(), phone: phone.trim(), address: address.trim(), avatar_url: avatarUrl.trim() || undefined });
      Alert.alert("Success", "Profile updated", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e) {
      console.error("Update profile error:", e);
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle" size={90} color="rgba(255,255,255,0.8)" />
        )}
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="0712345678"
          keyboardType="phone-pad"
          placeholderTextColor="#999"
          maxLength={10}
        />

        <Text style={styles.label}>Delivery Address</Text>
        <View style={styles.addressRow}>
          <TextInput
            style={[styles.input, styles.addressInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your default delivery address"
            multiline
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => router.push({ pathname: "/address-picker", params: { returnTo: "/edit-profile" } })}
          >
            <Ionicons name="map-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Avatar URL</Text>
        <TextInput
          style={styles.input}
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="https://example.com/avatar.jpg"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <LoadingSpinner size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: { position: "absolute", top: 60, left: 20 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  form: { padding: 20 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  addressRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  addressInput: { height: 100, textAlignVertical: "top", flex: 1 },
  mapButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    marginTop: 30,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
