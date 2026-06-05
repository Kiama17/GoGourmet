import { ActivityIndicator, StyleSheet, View } from "react-native";
import { COLORS } from "../styles/colors";
import { CartSkeleton, FoodDetailSkeleton, HomeSkeleton, OrdersSkeleton } from "./Skeleton";

type LoadingSpinnerProps = {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  skeleton?: boolean | "home" | "orders" | "cart" | "food-detail";
};

export default function LoadingSpinner({
  size = "large",
  color = COLORS.primary,
  fullScreen = false,
  skeleton = false,
}: LoadingSpinnerProps) {
  if (skeleton) {
    const type = typeof skeleton === "string" ? skeleton : "home";
    const SkeletonComponent = {
      home: HomeSkeleton,
      orders: OrdersSkeleton,
      cart: CartSkeleton,
      "food-detail": FoodDetailSkeleton,
    }[type];

    const content = <SkeletonComponent />;
    if (fullScreen) {
      return <View style={styles.fullScreen}>{content}</View>;
    }
    return content;
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

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
});
