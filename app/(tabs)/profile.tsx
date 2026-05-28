import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { icon: "person-outline" as const, label: "Edit Profile", route: null },
  { icon: "location-outline" as const, label: "Delivery Addresses", route: null },
  { icon: "card-outline" as const, label: "Payment Methods", route: null },
  { icon: "receipt-outline" as const, label: "My Orders", route: "/(tabs)/orders" },
  { icon: "heart-outline" as const, label: "Favorites", route: "/favourite" },
];

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logout();
            router.replace("/login");
          } catch {
            Alert.alert("Error", "Failed to logout. Try again.");
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/avatar.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User"}</Text>
        <Text style={styles.email}>{user?.email || "No email"}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.route && router.push(item.route as any)}
            disabled={!item.route}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.logoutDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <LoadingSpinner size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  name: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  email: { fontSize: 15, color: "rgba(255,255,255,0.85)", marginTop: 5 },
  menu: { padding: 20 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { fontSize: 16, fontWeight: "500" },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.danger,
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  logoutDisabled: { backgroundColor: "#ffaa99" },
  logoutText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
