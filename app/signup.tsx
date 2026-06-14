import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { analytics } from "../services/analytics";
import { sanitize } from "../utils/sanitize";

export default function SignupScreen() {
  const { colors, t } = useApp();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSignup = async () => {
    setError("");
    if (!displayName.trim()) { setError(t("auth.nameRequired")); return; }
    if (!email.trim()) { setError(t("auth.emailRequired")); return; }
    if (!password.trim()) { setError(t("auth.passwordRequired")); return; }
    if (password.length < 6) { setError(t("auth.passwordLength")); return; }
    if (password !== confirmPassword) { setError(t("auth.passwordsMatch")); return; }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        setConfirmationSent(true);
        setResendCooldown(60);
        showToast(t("auth.confirmationSent", { email }), "success");
      } else {
        analytics.track("user_registered", { user_id: data?.user?.id ?? "" });
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      setError(
        err.message?.includes("already registered") ? t("auth.alreadyExists") : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setResendCooldown(60);
      showToast(t("auth.confirmationSent", { email }), "success");
    } catch {
      showToast(t("common.error"), "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {confirmationSent ? (
        <View style={styles.confirmContainer}>
          <Ionicons name="mail-unread-outline" size={64} color={colors.primary} />
          <Text style={[styles.confirmTitle, { color: colors.text }]}>{t("auth.checkEmail")}</Text>
          <Text style={[styles.confirmText, { color: colors.subText }]}>
            {t("auth.confirmationSent", { email })}
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push("/login")}>
            <Text style={styles.buttonText}>{t("auth.goToLogin")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0} style={{ marginTop: 16 }}>
            <Text style={{ color: resendCooldown > 0 ? colors.subText : colors.primary, fontSize: 15, fontWeight: "600" }}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation email"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={[styles.appName, { color: colors.primary }]}>GoGourmet</Text>
            <Text style={[styles.title, { color: colors.text }]}>{t("auth.signup")}</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>Join us and start ordering</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#fff" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="person-outline" size={20} color={colors.subText} style={styles.inputIcon} />
            <TextInput placeholder={t("auth.fullName")} value={displayName} onChangeText={(v) => setDisplayName(sanitize(v))} autoCapitalize="words" style={[styles.input, { color: colors.text }]} placeholderTextColor={colors.subText} />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="mail-outline" size={20} color={colors.subText} style={styles.inputIcon} />
            <TextInput placeholder={t("auth.email")} value={email} onChangeText={(v) => setEmail(sanitize(v))} autoCapitalize="none" keyboardType="email-address" style={[styles.input, { color: colors.text }]} placeholderTextColor={colors.subText} />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
            <TextInput placeholder={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry style={[styles.input, { color: colors.text }]} placeholderTextColor={colors.subText} />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
            <TextInput placeholder={t("auth.confirmPassword")} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={[styles.input, { color: colors.text }]} placeholderTextColor={colors.subText} />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" color="#fff" /> : <Text style={styles.buttonText}>{t("auth.signup")}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={[styles.link, { color: colors.primary }]}>{t("auth.hasAccount")}</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d32f2f",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    fontSize: 14,
  },
  confirmContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: 16,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  confirmText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
