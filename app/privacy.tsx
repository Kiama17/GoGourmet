import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../hooks/useApp";

export default function PrivacyScreen() {
  const { colors } = useApp();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
      <Text style={[styles.updated, { color: colors.subText }]}>Last updated: June 2026</Text>

      <Text style={[styles.heading, { color: colors.text }]}>1. Information We Collect</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        We collect information you provide directly: name, email address, phone number, delivery addresses, and payment information. We also collect order history, device information, and location data when you use our service.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>2. How We Use Your Information</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        We use your information to process orders, facilitate deliveries, improve our service, send order updates, and provide customer support. With your consent, we may send promotional communications.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>3. Data Sharing</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        We share your information with restaurants to fulfill orders, with delivery partners for logistics, and with payment processors to handle transactions. We do not sell your personal data to third parties.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>4. Data Security</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data. However, no method of transmission is 100% secure.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>5. Your Rights</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        You may access, update, or delete your account information at any time through your profile settings. You can opt out of marketing communications by updating your notification preferences.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>6. Data Retention</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        We retain your information as long as your account is active or as needed to provide services. We may retain anonymized data for analytics purposes indefinitely.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>7. Contact</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        For privacy-related inquiries, contact us at privacy@gogourmet.com.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 4 },
  updated: { fontSize: 13, marginBottom: 24 },
  heading: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22 },
});
