import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../styles/colors";

import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getAnalytics, AnalyticsData } from "../../services/admin";

function Bar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={barStyles.col}>
      <Text style={barStyles.value}>{value.toLocaleString()}</Text>
      <View style={barStyles.barOuter}>
        <View style={[barStyles.barInner, { height: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={barStyles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  col: { alignItems: "center", flex: 1, maxWidth: 60 },
  value: { fontSize: 10, fontWeight: "bold", marginBottom: 4, color: COLORS.text },
  barOuter: {
    width: 24,
    height: 80,
    backgroundColor: COLORS.card,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barInner: { borderRadius: 6, minHeight: 2, width: "100%" },
  label: { fontSize: 9, color: COLORS.subText, marginTop: 4, textAlign: "center" },
});

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={miniStyles.row}>
      <View style={miniStyles.track}>
        <View style={[miniStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={miniStyles.val}>{value.toLocaleString()}</Text>
    </View>
  );
}

const miniStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 3 },
  track: { flex: 1, height: 8, backgroundColor: COLORS.card, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4, minWidth: 2 },
  val: { fontSize: 12, fontWeight: "600", width: 60, textAlign: "right" },
});

export default function AnalyticsScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const d = await getAnalytics();
      setData(d);
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return <ErrorMessage title="Analytics Error" message={error} />;
  }

  const maxDaily = Math.max(...(data?.dailyRevenue.map((d) => d.revenue) || [0]), 1);
  const maxItem = Math.max(...(data?.topItems.map((i) => i.count) || [0]), 1);
  const maxCat = Math.max(...(data?.categoryRevenue.map((c) => c.revenue) || [0]), 1);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* KPI row */}
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiValue}>KES {data?.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>All Time Revenue</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiValue}>KES {Math.round(data?.avgOrderValue || 0).toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>Avg Order Value</Text>
        </View>
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiValue}>KES {data?.revenueThisMonth.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>Revenue This Month</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiValue}>{data?.ordersThisMonth}</Text>
          <Text style={styles.kpiLabel}>Orders This Month</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiValue}>{data?.newUsersThisMonth}</Text>
          <Text style={styles.kpiLabel}>New Users / Mo</Text>
        </View>
      </View>

      {/* Revenue trend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Revenue (30 days)</Text>
        {data?.dailyRevenue.length === 0 ? (
          <Text style={styles.empty}>No data yet</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            <View style={styles.chart}>
              {data?.dailyRevenue.map((d) => (
                <Bar key={d.date} value={d.revenue} max={maxDaily} label={d.date.slice(5)} color="#28a745" />
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Top items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Selling Items</Text>
        {data?.topItems.length === 0 ? (
          <Text style={styles.empty}>No orders yet</Text>
        ) : (
          data?.topItems.map((item, i) => (
            <View key={item.name} style={styles.rankRow}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>KES {item.revenue.toLocaleString()}</Text>
              </View>
              <MiniBar value={item.count} max={maxItem} color="#ff6b00" />
            </View>
          ))
        )}
      </View>

      {/* Category performance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Revenue by Category</Text>
        {data?.categoryRevenue.length === 0 ? (
          <Text style={styles.empty}>No data yet</Text>
        ) : (
          data?.categoryRevenue.map((c) => (
            <View key={c.category} style={styles.catRow}>
              <Text style={styles.catName}>{c.category}</Text>
              <MiniBar value={c.revenue} max={maxCat} color="#4a90d9" />
            </View>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 30, gap: 16 },
  errorText: { fontSize: 16, color: COLORS.danger, textAlign: "center" },
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  kpi: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  kpiValue: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  kpiLabel: { fontSize: 11, color: COLORS.subText, marginTop: 4, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 14 },
  empty: { fontSize: 14, color: COLORS.subText, textAlign: "center", paddingVertical: 20 },
  chartScroll: { marginLeft: -8 },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 6, paddingHorizontal: 8, height: 140 },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  rank: { fontSize: 14, fontWeight: "bold", color: COLORS.subText, width: 24 },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemMeta: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
  catRow: { marginBottom: 8 },
  catName: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
});
