import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../styles/colors";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/(tabs)/home");
    }
  }, [isAdmin, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Text style={{ color: COLORS.subText, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.danger} />
        <Text style={{ color: COLORS.subText, fontSize: 16, marginTop: 12 }}>Access denied</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.text },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="orders" options={{ title: "Manage Orders" }} />
      <Stack.Screen name="menu" options={{ title: "Manage Menu" }} />
      <Stack.Screen name="analytics" options={{ title: "Analytics" }} />
      <Stack.Screen name="users" options={{ title: "Users" }} />
    </Stack>
  );
}
