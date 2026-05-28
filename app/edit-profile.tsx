import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
  const { user, updateProfile, loading } = useAuth();
  const { pickedAddress } = useLocalSearchParams<{ pickedAddress?: string }>();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [address, setAddress] = useState(user?.user_metadata?.address || "");
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
      await updateProfile({ display_name: displayName.trim(), email: email.trim(), phone: phone.trim(), address: address.trim() });
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
        <Image source={require("../assets/images/avatar.png")} style={styles.avatar} />
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
