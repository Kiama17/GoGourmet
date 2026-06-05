import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../styles/colors";

export default function ContactScreen() {
  const contactItems = [
    { icon: "mail-outline", label: "Email", value: "support@gogourmet.com", action: () => Linking.openURL("mailto:support@gogourmet.com") },
    { icon: "call-outline", label: "Phone", value: "+1 (555) 123-4567", action: () => Linking.openURL("tel:+15551234567") },
    { icon: "globe-outline", label: "Website", value: "www.gogourmet.com", action: () => Linking.openURL("https://www.gogourmet.com") },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="chatbubbles" size={60} color={COLORS.primary} />
        <Text style={styles.title}>Get in Touch</Text>
        <Text style={styles.subtitle}>We'd love to hear from you. Reach out anytime.</Text>
      </View>

      <View style={styles.card}>
        {contactItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.row} onPress={item.action}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.subText} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Hours</Text>
        <View style={styles.hoursRow}>
          <Text style={styles.hoursDay}>Monday - Friday</Text>
          <Text style={styles.hoursTime}>8:00 AM - 10:00 PM</Text>
        </View>
        <View style={styles.hoursRow}>
          <Text style={styles.hoursDay}>Saturday - Sunday</Text>
          <Text style={styles.hoursTime}>9:00 AM - 11:00 PM</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.address}>123 Gourmet Street, Foodie District, New York, NY 10001</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 28, gap: 8 },
  title: { fontSize: 26, fontWeight: "bold" },
  subtitle: { fontSize: 15, color: COLORS.subText, textAlign: "center" },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13, color: COLORS.subText },
  rowValue: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  hoursDay: { fontSize: 15, color: COLORS.text },
  hoursTime: { fontSize: 15, color: COLORS.subText },
  address: { fontSize: 15, color: COLORS.subText, lineHeight: 22 },
});
