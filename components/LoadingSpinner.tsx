import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import { COLORS } from "../styles/colors";

type LoadingSpinnerProps = {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  skeleton?: boolean;
};

export default function LoadingSpinner({
  size = "large",
  color = COLORS.primary,
  fullScreen = false,
  skeleton = false,
}: LoadingSpinnerProps) {
  if (skeleton) {
    return <SkeletonLoader />;
  }

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
}

function SkeletonLoader() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <Animated.View style={[styles.skeletonImage, { opacity }]} />
          <View style={styles.skeletonTextBlock}>
            <Animated.View
              style={[styles.skeletonLine, { width: "70%", opacity }]}
            />
            <Animated.View
              style={[styles.skeletonLine, { width: "40%", opacity }]}
            />
            <Animated.View
              style={[styles.skeletonLine, { width: "50%", opacity }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  skeletonContainer: {
    paddingTop: 10,
  },
  skeletonRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
  },
  skeletonImage: {
    width: 120,
    height: 120,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
  },
  skeletonTextBlock: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 10,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 7,
  },
});
