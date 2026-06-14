import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/colors";

import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getDashboardStats, DashboardStats } from "../../services/admin";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type StatCardKey = "totalOrders" | "totalRevenue" | "totalUsers" | "totalMenuItems";

const statCards: { key: StatCardKey; label: string; icon: IconName; color: string; prefix?: string }[] = [
  { key: "totalOrders", label: "Total Orders", icon: "receipt-outline", color: "#4a90d9" },
  { key: "totalRevenue", label: "Revenue", icon: "cash-outline", color: "#28a745", prefix: "KES " },
  { key: "totalUsers", label: "Users", icon: "people-outline", color: "#ff6b00" },
  { key: "totalMenuItems", label: "Menu Items", icon: "restaurant-outline", color: "#6f42c1" },
];

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return <ErrorMessage title="Dashboard Error" message={error} onRetry={loadStats} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Admin Overview</Text>

      <View style={styles.statsGrid}>
        {statCards.map((card) => {
          const value = stats ? stats[card.key] : 0;
          const display = card.key === "totalRevenue"
            ? `${card.prefix || ""}${value.toLocaleString()}`
            : `${card.prefix || ""}${value}`;
          return (
            <View key={card.key} style={[styles.statCard, { borderLeftColor: card.color }]}>
              <Ionicons name={card.icon} size={28} color={card.color} />
              <Text style={styles.statValue}>{display}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Orders by Status</Text>
      <View style={styles.statusRow}>
        {stats?.ordersByStatus.map((s) => (
          <View key={s.status} style={styles.statusChip}>
            <Text style={styles.statusCount}>{s.count}</Text>
            <Text style={styles.statusLabel}>{s.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/analytics")} accessibilityLabel="View Analytics" accessibilityRole="button">
          <Ionicons name="stats-chart-outline" size={24} color="#28a745" />
          <Text style={styles.actionText}>Analytics</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/orders")} accessibilityLabel="Manage Orders" accessibilityRole="button">
          <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Manage Orders</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/menu")} accessibilityLabel="Manage Menu" accessibilityRole="button">
          <Ionicons name="restaurant-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Manage Menu</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/users")} accessibilityLabel="View Users" accessibilityRole="button">
          <Ionicons name="people-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>View Users</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 30, gap: 16 },
  errorText: { fontSize: 16, color: COLORS.danger, textAlign: "center" },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "bold" },
  greeting: { fontSize: 28, fontWeight: "bold", marginBottom: 20, marginTop: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    gap: 6,
  },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 14, color: COLORS.subText },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statusChip: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    minWidth: 80,
  },
  statusCount: { fontSize: 22, fontWeight: "bold" },
  statusLabel: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
  quickActions: { marginBottom: 30 },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  actionText: { flex: 1, fontSize: 16, fontWeight: "500" },
});
