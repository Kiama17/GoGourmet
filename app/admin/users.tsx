import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../styles/colors";

import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getAllUsers } from "../../services/admin";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return <ErrorMessage title="Users Error" message={error} onRetry={loadUsers} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="No users" subtitle="No users have signed up yet" />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.display_name || item.email || "Unknown"}</Text>
              <Text style={styles.email}>{item.email || ""}</Text>
              <Text style={styles.meta}>
                {item.phone || "No phone"} {item.role === "admin" ? "• Admin" : ""}
              </Text>
            </View>
            <View style={[styles.roleBadge, item.role === "admin" && styles.adminBadge]}>
              <Text style={[styles.roleText, item.role === "admin" && styles.adminText]}>
                {item.role || "user"}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 30, gap: 16 },
  errorText: { fontSize: 16, color: COLORS.danger, textAlign: "center" },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 13, color: COLORS.subText, marginTop: 2 },
  meta: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.card,
  },
  adminBadge: { backgroundColor: COLORS.primary + "20" },
  roleText: { fontSize: 12, fontWeight: "600", color: COLORS.subText },
  adminText: { color: COLORS.primary },
});
