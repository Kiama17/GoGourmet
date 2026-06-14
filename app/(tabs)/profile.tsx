import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../hooks/useApp";

export default function ProfileScreen() {
  const { user, profile, logout, loading, isAdmin } = useAuth();
  const { colors, t, isDark, toggleTheme, locale, setLocale, availableLocales } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(t("auth.logout"), "Are you sure you want to log out?", [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("auth.logout"), style: "destructive", onPress: async () => {
        setLoggingOut(true);
        try { await logout(); } catch { /* ignore */ }
        setLoggingOut(false);
      }},
    ]);
  };

  const toggleLanguage = () => {
    const next = locale === "en" ? "sw" : "en";
    setLocale(next);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Ionicons name="person-circle-outline" size={80} color={colors.white} />
        <Text style={styles.name}>{profile?.display_name || user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/edit-profile")} accessibilityLabel={t("profile.editProfile")} accessibilityRole="button">
          <Ionicons name="person-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.editProfile")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/addresses")} accessibilityLabel={t("profile.savedAddresses")} accessibilityRole="button">
          <Ionicons name="location-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.savedAddresses")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/(tabs)/orders")} accessibilityLabel={t("profile.orderHistory")} accessibilityRole="button">
          <Ionicons name="receipt-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.orderHistory")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/notifications")} accessibilityLabel={t("profile.notifications")} accessibilityRole="button">
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.notifications")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/admin")} accessibilityLabel={t("profile.adminDashboard")} accessibilityRole="button">
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.adminDashboard")}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </TouchableOpacity>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <Ionicons name="moon-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { flex: 1, color: colors.text }]}>{t("profile.darkMode")}</Text>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
        </View>

        <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <Ionicons name="language-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { flex: 1, color: colors.text }]}>{t("profile.language")}</Text>
          <TouchableOpacity onPress={toggleLanguage} accessibilityLabel={t("profile.language")} accessibilityRole="button">
            <Text style={[styles.languageToggle, { color: colors.primary }]}>{availableLocales.find((l) => l.code === locale)?.name}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/terms")} accessibilityLabel={t("profile.termsOfService")} accessibilityRole="button">
          <Ionicons name="document-text-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.termsOfService")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/privacy")} accessibilityLabel={t("profile.privacyPolicy")} accessibilityRole="button">
          <Ionicons name="lock-closed-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.privacyPolicy")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push("/contact")} accessibilityLabel={t("profile.contactUs")} accessibilityRole="button">
          <Ionicons name="call-outline" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t("profile.contactUs")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.danger }]} onPress={handleLogout} accessibilityLabel={t("auth.logout")} accessibilityRole="button" disabled={loggingOut}>
        {loggingOut ? (
          <LoadingSpinner size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color={colors.white} />
            <Text style={styles.logoutText}>{t("auth.logout")}</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff", marginTop: 12 },
  email: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  menu: { marginTop: 20, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuText: { flex: 1, fontSize: 16 },
  languageToggle: { fontSize: 16, fontWeight: "600" },
  divider: { height: 1, marginVertical: 8 },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
    padding: 16,
    borderRadius: 14,
  },
  logoutText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});