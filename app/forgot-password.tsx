import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../services/supabaseClient";
import { useToast } from "../context/ToastContext";
import { useApp } from "../hooks/useApp";
import { sanitize } from "../utils/sanitize";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { colors, t } = useApp();

  const handleReset = async () => {
    if (!email.trim()) {
      showToast(t("auth.emailRequired"), "error");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSent(true);
      showToast(t("forgot.resetSent"), "success");
    } catch (err: any) {
      showToast(err.message || t("forgot.failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.primary }]}>GoGourmet</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t("forgot.resetPassword")}</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {sent ? t("forgot.linkSent") : t("forgot.subtitle")}
        </Text>
      </View>

      {sent ? (
        <View style={styles.sentContainer}>
          <Ionicons name="mail-outline" size={64} color={colors.success} />
          <Text style={[styles.sentText, { color: colors.subText }]}>
            {t("forgot.checkInbox")}
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.text }]} onPress={() => router.push("/login")}>
            <Text style={styles.buttonText}>{t("forgot.backToLogin")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="mail-outline" size={20} color={colors.subText} style={styles.inputIcon} />
            <TextInput
              placeholder={t("forgot.emailPlaceholder")}
              value={email}
              onChangeText={(v) => setEmail(sanitize(v))}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: colors.text }]}
              placeholderTextColor={colors.subText}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.text }, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("forgot.sendResetLink")}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={[styles.link, { color: colors.primary }]}>{t("forgot.backToLogin")}</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  appName: { fontSize: 14, fontWeight: "bold", letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 6, textAlign: "center" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    height: 52,
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  link: { marginTop: 20, textAlign: "center", fontSize: 15, fontWeight: "500" },
  sentContainer: { alignItems: "center", gap: 16, paddingHorizontal: 20 },
  sentText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});
