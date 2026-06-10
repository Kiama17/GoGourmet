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
import { COLORS } from "../styles/colors";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../services/supabaseClient";
import { useToast } from "../context/ToastContext";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleReset = async () => {
    if (!email.trim()) {
      showToast("Please enter your email", "error");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSent(true);
      showToast("Password reset link sent to your email", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send reset email", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.appName}>GoGourmet</Text>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {sent
            ? "Check your email for the reset link"
            : "Enter your email and we'll send you a reset link"}
        </Text>
      </View>

      {sent ? (
        <View style={styles.sentContainer}>
          <Ionicons name="mail-outline" size={64} color={COLORS.success} />
          <Text style={styles.sentText}>
            If an account exists with that email, you will receive a password reset link shortly.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.subText} style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  appName: { fontSize: 14, fontWeight: "bold", color: COLORS.primary, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { fontSize: 16, color: COLORS.subText, marginTop: 6, textAlign: "center" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  button: {
    backgroundColor: COLORS.text,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    height: 52,
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  link: { marginTop: 20, textAlign: "center", color: COLORS.primary, fontSize: 15, fontWeight: "500" },
  sentContainer: { alignItems: "center", gap: 16, paddingHorizontal: 20 },
  sentText: { fontSize: 15, color: COLORS.subText, textAlign: "center", lineHeight: 22 },
});
