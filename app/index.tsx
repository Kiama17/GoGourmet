import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      const onboardingDone = await AsyncStorage.getItem("onboarding_complete");
      if (onboardingDone) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/onboarding");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/splash.png")}
        style={styles.image}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.branding, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <Text style={styles.appName}>GoGourmet</Text>
            <Text style={styles.tagline}>Delicious food, delivered fast</Text>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 100,
  },
  branding: { alignItems: "center" },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    letterSpacing: 1,
  },
});
