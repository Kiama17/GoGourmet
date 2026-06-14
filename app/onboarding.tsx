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
import { useApp } from "../hooks/useApp";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "onboarding_complete";

interface Slide {
  icon: IconName;
  title: string;
  description: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, t } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: Slide[] = [
    {
      icon: "restaurant",
      title: t("onboarding.browseTitle"),
      description: t("onboarding.browseDesc"),
    },
    {
      icon: "cart",
      title: t("onboarding.orderTitle"),
      description: t("onboarding.orderDesc"),
    },
    {
      icon: "location",
      title: t("onboarding.deliveryTitle"),
      description: t("onboarding.deliveryDesc"),
    },
  ];

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
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

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconWrap, { backgroundColor: colors.card }]}>
        <Ionicons name={item.icon} size={80} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.subText }]}>{item.description}</Text>
    </View>
  );

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={skip} style={styles.skipBtn} accessibilityLabel={t("onboarding.skip")} accessibilityRole="button">
        <Text style={[styles.skipText, { color: colors.subText }]}>{t("onboarding.skip")}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item, i) => `${item.icon}-${i}`}
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
                style={[styles.dot, { backgroundColor: colors.primary, opacity, transform: [{ scale }] }]}
              />
            );
          })}
        </View>

        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={nextSlide} accessibilityLabel={isLast ? t("onboarding.getStarted") : t("onboarding.next")} accessibilityRole="button">
          <Text style={styles.nextText}>{isLast ? t("onboarding.getStarted") : t("onboarding.next")}</Text>
          <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: "absolute", top: 60, right: 24, zIndex: 10 },
  skipText: { fontSize: 16, fontWeight: "600" },
  slide: { width, flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  iconWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  description: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    gap: 24,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  nextBtn: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
