import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  // Sample data - eventually this will come from your database
  const userName = "Tinah Kiama";
  const userEmail = "tinah.kiama@example.com";

  const MenuItem = ({
    icon,
    title,
    subtitle,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color="#E67E22" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person-circle" size={80} color="#DDD" />
        </View>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <MenuItem
          icon="location-outline"
          title="Saved Addresses"
          subtitle="Home, Office, etc."
        />
        <MenuItem
          icon="card-outline"
          title="Payment Methods"
          subtitle="M-Pesa, Cards"
        />
        <MenuItem icon="notifications-outline" title="Notifications" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <MenuItem icon="help-circle-outline" title="Help Center" />
        <MenuItem icon="document-text-outline" title="Terms & Conditions" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>GoGourmet v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    backgroundColor: "#FFF",
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  profileImageContainer: { marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "#777", marginBottom: 15 },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E67E22",
  },
  editButtonText: { color: "#E67E22", fontWeight: "600" },
  section: { marginTop: 25, backgroundColor: "#FFF", paddingHorizontal: 15 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIconContainer: { width: 40 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, color: "#333" },
  menuSubtitle: { fontSize: 12, color: "#AAA" },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#FFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4D4D",
  },
  logoutText: { color: "#FF4D4D", fontWeight: "bold", fontSize: 16 },
  version: {
    textAlign: "center",
    color: "#BBB",
    marginVertical: 20,
    fontSize: 12,
  },
});
