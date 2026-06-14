import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useNotification } from "../context/NotificationContext";
import { useApp } from "../hooks/useApp";

const PREFS_KEY = "gogourmet_notification_prefs";

export default function NotificationsScreen() {
  const { expoPushToken, permissionGranted, setupDone } = useNotification();
  const { colors, t } = useApp();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((saved) => {
      if (saved) {
        try {
          const prefs = JSON.parse(saved);
          setOrderUpdates(prefs.orderUpdates ?? true);
          setPromotions(prefs.promotions ?? false);
        } catch {}
      }
    });
  }, []);

  const savePrefs = useCallback(async (updates: boolean, promos: boolean) => {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ orderUpdates: updates, promotions: promos }));
  }, []);

  const handleOrderUpdates = (val: boolean) => {
    setOrderUpdates(val);
    savePrefs(val, promotions);
  };

  const handlePromotions = (val: boolean) => {
    setPromotions(val);
    savePrefs(orderUpdates, val);
  };

  const copyToken = () => {
    if (expoPushToken) {
      Alert.alert("Push Token", expoPushToken);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
        <Ionicons
          name={permissionGranted ? "notifications" : "notifications-off"}
          size={40}
          color={permissionGranted ? colors.success : colors.subText}
        />
        <Text style={[styles.statusTitle, { color: colors.text }]}>
          {permissionGranted ? t("notifications.enabled") : t("notifications.disabled")}
        </Text>
        <Text style={[styles.statusSubtitle, { color: colors.subText }]}>
          {permissionGranted ? t("notifications.enabledDesc") : t("notifications.disabledDesc")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("notifications.preferences")}</Text>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowInfo}>
            <Ionicons name="receipt-outline" size={22} color={colors.primary} />
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t("notifications.orderUpdates")}</Text>
              <Text style={[styles.rowSub, { color: colors.subText }]}>{t("notifications.orderUpdatesDesc")}</Text>
            </View>
          </View>
          <Switch
            value={orderUpdates}
            onValueChange={handleOrderUpdates}
            trackColor={{ false: "#ddd", true: colors.secondary }}
            thumbColor={orderUpdates ? colors.primary : "#f4f3f4"}
          />
        </View>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowInfo}>
            <Ionicons name="pricetag-outline" size={22} color={colors.subText} />
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.subText }]}>{t("notifications.promotions")}</Text>
              <Text style={[styles.rowSub, { color: colors.subText }]}>{t("notifications.promotionsDesc")}</Text>
            </View>
          </View>
          <Switch
            value={promotions}
            onValueChange={handlePromotions}
            trackColor={{ false: "#ddd", true: colors.secondary }}
            thumbColor={promotions ? colors.primary : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("notifications.deviceInfo")}</Text>
        {expoPushToken ? (
          <TouchableOpacity style={[styles.tokenRow, { backgroundColor: colors.card }]} onPress={copyToken}>
            <Text style={[styles.tokenLabel, { color: colors.subText }]}>{t("notifications.pushToken")}</Text>
            <Text style={[styles.tokenValue, { color: colors.text }]} numberOfLines={1}>{expoPushToken}</Text>
            <Ionicons name="copy-outline" size={16} color={colors.subText} />
          </TouchableOpacity>
        ) : (
          <Text style={[styles.noToken, { color: colors.subText }]}>
            {t("notifications.noToken")}{setupDone ? "" : ` (${t("notifications.initializing")})`}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  statusCard: {
    alignItems: "center",
    borderRadius: 16,
    padding: 30,
    marginBottom: 24,
    gap: 8,
  },
  statusTitle: { fontSize: 18, fontWeight: "bold", marginTop: 8 },
  statusSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowInfo: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "600" },
  rowSub: { fontSize: 13, marginTop: 2 },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  tokenLabel: { fontSize: 13, minWidth: 100 },
  tokenValue: { flex: 1, fontSize: 12 },
  noToken: { fontSize: 14, fontStyle: "italic" },
});
