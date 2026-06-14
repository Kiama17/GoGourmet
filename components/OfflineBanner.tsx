import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useNetwork } from "../context/NetworkContext";
import { useApp } from "../hooks/useApp";

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const { colors, t } = useApp();
  const translateY = useRef(new Animated.Value(isConnected ? -60 : 0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -60 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, translateY]);

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: colors.danger, transform: [{ translateY }] },
      ]}
      pointerEvents={isConnected ? "none" : "auto"}
    >
      <Text style={styles.text}>
        {t("common.offline") || "You are offline. Check your connection."}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
