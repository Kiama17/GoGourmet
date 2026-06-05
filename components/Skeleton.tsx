import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

type SkeletonBoxProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

function SkeletonBox({ width = "100%", height = 20, borderRadius = 8, style }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#e0e0e0",
        },
        style,
        { opacity },
      ]}
    />
  );
}

type SkeletonCircleProps = {
  size: number;
  style?: ViewStyle;
};

function SkeletonCircle({ size, style }: SkeletonCircleProps) {
  return <SkeletonBox width={size} height={size} borderRadius={size / 2} style={style} />;
}

type SkeletonTextLinesProps = {
  lines?: number;
  lastWidth?: string;
  style?: ViewStyle;
};

function SkeletonTextLines({ lines = 3, lastWidth = "60%", style }: SkeletonTextLinesProps) {
  return (
    <View style={[{ gap: 8 }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 ? lastWidth : "100%"}
          height={14}
        />
      ))}
    </View>
  );
}

export const Skeleton = {
  Box: SkeletonBox,
  Circle: SkeletonCircle,
  TextLines: SkeletonTextLines,
};

/* ---------- Screen-specific skeletons ---------- */

export function HomeSkeleton() {
  return (
    <View style={s.container}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={s.foodCard}>
          <SkeletonBox width={120} height={130} borderRadius={0} />
          <View style={s.cardInfo}>
            <SkeletonBox width="75%" height={18} />
            <SkeletonBox width="50%" height={13} />
            <SkeletonBox width="35%" height={17} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function OrdersSkeleton() {
  return (
    <View style={s.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={s.orderCard}>
          <View style={s.orderHeader}>
            <SkeletonBox width="40%" height={16} />
            <SkeletonBox width={80} height={24} borderRadius={12} />
          </View>
          <SkeletonBox width="30%" height={13} style={{ marginBottom: 12 }} />
          {[1, 2].map((j) => (
            <View key={j} style={s.itemRow}>
              <SkeletonBox width="60%" height={14} />
              <SkeletonBox width={70} height={14} />
            </View>
          ))}
          <View style={s.divider} />
          <View style={s.totalRow}>
            <SkeletonBox width={50} height={16} />
            <SkeletonBox width={80} height={20} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CartSkeleton() {
  return (
    <View style={s.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={s.cartItem}>
          <SkeletonBox width={80} height={80} borderRadius={12} />
          <View style={s.cartInfo}>
            <SkeletonBox width="70%" height={16} />
            <SkeletonBox width="40%" height={14} />
            <View style={s.quantityRow}>
              <SkeletonBox width={30} height={30} borderRadius={8} />
              <SkeletonBox width={24} height={16} />
              <SkeletonBox width={30} height={30} borderRadius={8} />
            </View>
          </View>
        </View>
      ))}
      <View style={s.summaryCard}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={s.summaryRow}>
            <SkeletonBox width="50%" height={15} />
            <SkeletonBox width={70} height={15} />
          </View>
        ))}
        <View style={s.divider} />
        <View style={s.summaryRow}>
          <SkeletonBox width={60} height={18} />
          <SkeletonBox width={90} height={22} />
        </View>
      </View>
    </View>
  );
}

export function FoodDetailSkeleton() {
  return (
    <View style={s.container}>
      <SkeletonBox width="100%" height={220} borderRadius={0} />
      <View style={{ padding: 20, gap: 12 }}>
        <SkeletonBox width="70%" height={26} />
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <SkeletonBox width={80} height={18} />
          <SkeletonBox width={60} height={18} />
        </View>
        <SkeletonBox width="40%" height={24} />
        <Skeleton.TextLines lines={4} lastWidth="80%" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingTop: 10 },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
  },
  cardInfo: { flex: 1, padding: 12, justifyContent: "center", gap: 8 },
  orderCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 10 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 14,
  },
  cartInfo: { flex: 1, gap: 8 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
