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
import { useApp } from "../hooks/useApp";
import { analytics } from "../services/analytics";
import { sanitize } from "../utils/sanitize";

export default function LoginScreen() {
  const { colors, t } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) { setError(t("auth.emailRequired")); return; }
    if (!password.trim()) { setError(t("auth.passwordRequired")); return; }

    try {
      setLoading(true);
      const { data } = await supabase.auth.signInWithPassword({ email, password });
      analytics.track("user_logged_in", { user_id: data?.user?.id ?? "" });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.message.includes("invalid-credential")
        ? "Invalid email or password"
        : err.message);
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
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>Sign in to continue ordering</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color="#fff" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="mail-outline" size={20} color={colors.subText} style={styles.inputIcon} />
        <TextInput placeholder={t("auth.email")} value={email} onChangeText={(v) => setEmail(sanitize(v))} autoCapitalize="none" keyboardType="email-address" style={[styles.input, { color: colors.text }]} placeholderTextColor={colors.subText} />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
        <TextInput placeholder={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry style={[styles.input, { color: colors.text }]} placeholderTextColor={colors.subText} />
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.text }, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        {loading ? <LoadingSpinner size="small" color="#fff" /> : <Text style={styles.buttonText}>{t("auth.login")}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={[styles.forgotLink, { color: colors.subText }]}>{t("auth.forgotPassword")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={[styles.link, { color: colors.primary }]}>{t("auth.noAccount")}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  appName: { fontSize: 14, fontWeight: "bold", letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 6 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d32f2f",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: { color: "#fff", fontSize: 14, flex: 1 },
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
  forgotLink: { marginTop: 4, textAlign: "center", fontSize: 14 },
});
