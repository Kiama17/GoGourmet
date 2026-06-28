import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Native } from "sentry-expo";
import { ThemeContext } from "../context/ThemeContext";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Native.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ThemeContext.Consumer>
          {(ctx) => {
            const c = ctx?.colors ?? { background: "#fff", card: "#f5f5f5", text: "#000", subText: "#666", primary: "#E3731E", danger: "#dc3545" } as any;
            return (
              <View style={[styles.container, { backgroundColor: c.background }]}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="bug-outline" size={56} color={c.danger} />
                </View>
                <Text style={[styles.title, { color: c.text }]}>Unexpected Error</Text>
                <Text style={[styles.message, { color: c.subText }]}>
                  {this.state.error?.message || "An unexpected error occurred"}
                </Text>
                <TouchableOpacity style={[styles.button, { backgroundColor: c.primary }]} onPress={this.handleReset} activeOpacity={0.85}>
                  <Ionicons name="refresh-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </ThemeContext.Consumer>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
