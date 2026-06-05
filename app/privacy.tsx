import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../styles/colors";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: June 2026</Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.body}>
        We collect information you provide directly: name, email address, phone number, delivery addresses, and payment information. We also collect order history, device information, and location data when you use our service.
      </Text>

      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.body}>
        We use your information to process orders, facilitate deliveries, improve our service, send order updates, and provide customer support. With your consent, we may send promotional communications.
      </Text>

      <Text style={styles.heading}>3. Data Sharing</Text>
      <Text style={styles.body}>
        We share your information with restaurants to fulfill orders, with delivery partners for logistics, and with payment processors to handle transactions. We do not sell your personal data to third parties.
      </Text>

      <Text style={styles.heading}>4. Data Security</Text>
      <Text style={styles.body}>
        We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data. However, no method of transmission is 100% secure.
      </Text>

      <Text style={styles.heading}>5. Your Rights</Text>
      <Text style={styles.body}>
        You may access, update, or delete your account information at any time through your profile settings. You can opt out of marketing communications by updating your notification preferences.
      </Text>

      <Text style={styles.heading}>6. Data Retention</Text>
      <Text style={styles.body}>
        We retain your information as long as your account is active or as needed to provide services. We may retain anonymized data for analytics purposes indefinitely.
      </Text>

      <Text style={styles.heading}>7. Contact</Text>
      <Text style={styles.body}>
        For privacy-related inquiries, contact us at privacy@gogourmet.com.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 4 },
  updated: { fontSize: 13, color: COLORS.subText, marginBottom: 24 },
  heading: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 6, color: COLORS.text },
  body: { fontSize: 15, lineHeight: 22, color: COLORS.subText },
});
