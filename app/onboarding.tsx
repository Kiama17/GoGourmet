import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../styles/colors";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "onboarding_complete";

const slides = [
  {
    icon: "restaurant",
    title: "Browse Delicious Menu",
    description: "Explore a wide variety of meals crafted by top chefs. From local favorites to international cuisine.",
  },
  {
    icon: "cart",
    title: "Easy Ordering",
    description: "Add items to your cart, customize your meal, and checkout in seconds.",
  },
  {
    icon: "location",
    title: "Fast Delivery",
    description: "Track your order in real-time and get it delivered right to your door.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)/home");
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)/home");
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={styles.slide}>
      <View style={styles.iconWrap}>
        <Ionicons name={item.icon as any} size={80} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={skip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            const scale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity, transform: [{ scale }] }]}
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={nextSlide}>
          <Text style={styles.nextText}>{isLast ? "Get Started" : "Next"}</Text>
          <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  skipBtn: { position: "absolute", top: 60, right: 24, zIndex: 10 },
  skipText: { fontSize: 16, color: COLORS.subText, fontWeight: "600" },
  slide: { width, flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  iconWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  description: { fontSize: 16, color: COLORS.subText, textAlign: "center", lineHeight: 24 },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    gap: 24,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  nextBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
