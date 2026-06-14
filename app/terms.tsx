import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../hooks/useApp";

export default function TermsScreen() {
  const { colors } = useApp();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
      <Text style={[styles.updated, { color: colors.subText }]}>Last updated: June 2026</Text>

      <Text style={[styles.heading, { color: colors.text }]}>1. Acceptance of Terms</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        By accessing or using GoGourmet, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>2. Description of Service</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        GoGourmet is a food delivery platform that connects users with local restaurants and delivery partners. We facilitate orders, payments, and delivery logistics.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>3. User Accounts</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate, current information and promptly update it as needed.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>4. Orders and Payments</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        All orders are subject to availability and confirmation. Prices are displayed in the local currency and include applicable taxes. Payment is due at the time of order.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>5. Cancellations and Refunds</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        Cancellation policies vary by restaurant. Refunds are processed in accordance with our refund policy and may take up to 10 business days to appear.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>6. Limitation of Liability</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        GoGourmet is not liable for any indirect, incidental, or consequential damages arising from the use of our service, including but not limited to food quality or delivery delays.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>7. Changes to Terms</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
      </Text>

      <Text style={[styles.heading, { color: colors.text }]}>8. Contact</Text>
      <Text style={[styles.body, { color: colors.subText }]}>
        For questions about these terms, please contact us at support@gogourmet.com.
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
