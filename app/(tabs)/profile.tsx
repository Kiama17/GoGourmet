import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { COLORS } from "../../styles/colors";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={90} color="#ff6b00" />
        </View>
        <Text style={styles.username}>
          {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User"}
        </Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/edit-profile")}>
          <Ionicons name="person-outline" size={22} color="#ff6b00" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/addresses")}>
          <Ionicons name="location-outline" size={22} color="#ff6b00" />
          <Text style={styles.menuText}>Saved Addresses</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/orders")}>
          <Ionicons name="receipt-outline" size={22} color="#ff6b00" />
          <Text style={styles.menuText}>Order History</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={22} color="#ff6b00" />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/admin")}>
            <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.primary} />
            <Text style={[styles.menuText, { color: COLORS.primary, fontWeight: "bold" }]}>Admin Dashboard</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.legalSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/terms")}>
          <Ionicons name="document-text-outline" size={22} color="#999" />
          <Text style={[styles.menuText, { color: "#999" }]}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/privacy")}>
          <Ionicons name="shield-outline" size={22} color="#999" />
          <Text style={[styles.menuText, { color: "#999" }]}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/contact")}>
          <Ionicons name="mail-outline" size={22} color="#999" />
          <Text style={[styles.menuText, { color: "#999" }]}>Contact Us</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    marginLeft: 14,
  },
  legalSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6b00",
    margin: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});