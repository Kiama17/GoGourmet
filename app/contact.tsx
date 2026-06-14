import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useApp } from "../hooks/useApp";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function ContactScreen() {
  const { colors, t } = useApp();
  const contactItems: { icon: IconName; label: string; value: string; action: () => void }[] = [
    { icon: "mail-outline", label: t("contact.email"), value: "support@gogourmet.com", action: () => Linking.openURL("mailto:support@gogourmet.com") },
    { icon: "call-outline", label: t("contact.phone"), value: "+1 (555) 123-4567", action: () => Linking.openURL("tel:+15551234567") },
    { icon: "globe-outline", label: t("contact.website"), value: "www.gogourmet.com", action: () => Linking.openURL("https://www.gogourmet.com") },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="chatbubbles" size={60} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{t("contact.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>{t("contact.subtitle")}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {contactItems.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.row, { borderBottomColor: colors.border }]} onPress={item.action}>
            <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.subText }]}>{item.label}</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{item.value}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.subText} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("contact.businessHours")}</Text>
        <View style={[styles.hoursRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.hoursDay, { color: colors.text }]}>{t("contact.weekdays")}</Text>
          <Text style={[styles.hoursTime, { color: colors.subText }]}>8:00 AM - 10:00 PM</Text>
        </View>
        <View style={[styles.hoursRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.hoursDay, { color: colors.text }]}>{t("contact.weekends")}</Text>
          <Text style={[styles.hoursTime, { color: colors.subText }]}>9:00 AM - 11:00 PM</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("contact.address")}</Text>
        <Text style={[styles.address, { color: colors.subText }]}>123 Gourmet Street, Foodie District, New York, NY 10001</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 28, gap: 8 },
  title: { fontSize: 26, fontWeight: "bold" },
  subtitle: { fontSize: 15, textAlign: "center" },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  hoursDay: { fontSize: 15 },
  hoursTime: { fontSize: 15 },
  address: { fontSize: 15, lineHeight: 22 },
});
