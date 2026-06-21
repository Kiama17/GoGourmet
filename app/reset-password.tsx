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

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { colors, t } = useApp();

  useEffect(() => {
    const hash = Platform.OS === "web" ? window.location.hash : "";
    if (hash && hash.includes("type=recovery")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        }).then(({ error }) => {
          if (!error) setSessionReady(true);
          else showToast("Invalid or expired reset link. Please request a new one.", "error");
        });
      }
    } else {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      showToast("Password updated successfully", "success");
      router.replace("/login");
    } catch (err: any) {
      showToast(err.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.primary }]}>GoGourmet</Text>
        <Text style={[styles.title, { color: colors.text }]}>Set New Password</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Enter your new password below.
        </Text>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
        <TextInput
          placeholder="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.subText}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
        <TextInput
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
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
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
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
});
