import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../styles/colors";
import { useNotification } from "../context/NotificationContext";

export default function NotificationsScreen() {
  const { expoPushToken, permissionGranted, setupDone } = useNotification();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const copyToken = () => {
    if (expoPushToken) {
      Alert.alert("Push Token", expoPushToken);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusCard}>
        <Ionicons
          name={permissionGranted ? "notifications" : "notifications-off"}
          size={40}
          color={permissionGranted ? COLORS.success : COLORS.subText}
        />
        <Text style={styles.statusTitle}>
          {permissionGranted ? "Notifications Enabled" : "Notifications Disabled"}
        </Text>
        <Text style={styles.statusSubtitle}>
          {permissionGranted
            ? "You will receive order updates and alerts"
            : "Enable notifications in your device settings"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Ionicons name="receipt-outline" size={22} color={COLORS.primary} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Order Updates</Text>
              <Text style={styles.rowSub}>Status changes and delivery alerts</Text>
            </View>
          </View>
          <Switch
            value={orderUpdates}
            onValueChange={setOrderUpdates}
            trackColor={{ false: "#ddd", true: COLORS.secondary }}
            thumbColor={orderUpdates ? COLORS.primary : "#f4f3f4"}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Ionicons name="pricetag-outline" size={22} color={COLORS.subText} />
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: COLORS.subText }]}>Promotions</Text>
              <Text style={styles.rowSub}>Special offers and discounts</Text>
            </View>
          </View>
          <Switch
            value={promotions}
            onValueChange={setPromotions}
            trackColor={{ false: "#ddd", true: COLORS.secondary }}
            thumbColor={promotions ? COLORS.primary : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Info</Text>
        {expoPushToken ? (
          <TouchableOpacity style={styles.tokenRow} onPress={copyToken}>
            <Text style={styles.tokenLabel}>Expo Push Token</Text>
            <Text style={styles.tokenValue} numberOfLines={1}>{expoPushToken}</Text>
            <Ionicons name="copy-outline" size={16} color={COLORS.subText} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.noToken}>No push token available{setupDone ? "" : " (initializing...)"}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  statusCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    marginBottom: 24,
    gap: 8,
  },
  statusTitle: { fontSize: 18, fontWeight: "bold", marginTop: 8 },
  statusSubtitle: { fontSize: 14, color: COLORS.subText, textAlign: "center", lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  rowInfo: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "600" },
  rowSub: { fontSize: 13, color: COLORS.subText, marginTop: 2 },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  tokenLabel: { fontSize: 13, color: COLORS.subText, minWidth: 100 },
  tokenValue: { flex: 1, fontSize: 12, color: COLORS.text },
  noToken: { fontSize: 14, color: COLORS.subText, fontStyle: "italic" },
});
