import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../styles/colors";

const previewFoods = [
  { id: "1", name: "Burger Deluxe", price: 850, category: "Burger" },
  { id: "2", name: "Pepperoni Pizza", price: 1200, category: "Pizza" },
  { id: "3", name: "Chicken Wrap", price: 650, category: "Wraps" },
];

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={frameStyles.wrapper}>
      <Text style={frameStyles.label}>{label}</Text>
      <View style={frameStyles.frame}>
        <View style={frameStyles.notch} />
        {children}
      </View>
    </View>
  );
}

const frameStyles = StyleSheet.create({
  wrapper: { alignItems: "center", marginBottom: 40 },
  label: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 12 },
  frame: {
    width: 320,
    height: 640,
    backgroundColor: "#fff",
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#333",
    overflow: "hidden",
    paddingTop: 36,
  },
  notch: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    width: 100,
    height: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    zIndex: 10,
  },
});

function HomePreview() {
  return (
    <View style={previewStyles.homeContainer}>
      <View style={previewStyles.header}>
        <View>
          <Text style={previewStyles.greeting}>Hungry?</Text>
          <Text style={previewStyles.title}>Food Delivery</Text>
        </View>
        <Ionicons name="heart" size={22} color={COLORS.primary} />
      </View>
      <View style={previewStyles.searchBar}>
        <Ionicons name="search-outline" size={16} color="#999" />
        <Text style={previewStyles.searchText}>Search food...</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={previewStyles.chips}>
        {["All", "Burger", "Pizza", "Wraps"].map((c) => (
          <View key={c} style={[previewStyles.chip, c === "All" && previewStyles.chipActive]}>
            <Text style={[previewStyles.chipText, c === "All" && previewStyles.chipTextActive]}>
              {c}
            </Text>
          </View>
        ))}
      </ScrollView>
      {previewFoods.map((food) => (
        <View key={food.id} style={previewStyles.card}>
          <View style={previewStyles.cardImage} />
          <View style={previewStyles.cardInfo}>
            <Text style={previewStyles.foodName}>{food.name}</Text>
            <Text style={previewStyles.foodCategory}>{food.category}</Text>
            <Text style={previewStyles.foodPrice}>KES {food.price}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function CartPreview() {
  return (
    <View style={previewStyles.homeContainer}>
      <Text style={[previewStyles.title, { marginBottom: 16 }]}>My Cart</Text>
      {previewFoods.map((food) => (
        <View key={food.id} style={previewStyles.cartItem}>
          <View style={previewStyles.cartImage} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={previewStyles.foodName}>{food.name}</Text>
            <Text style={previewStyles.foodPrice}>KES {food.price}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={previewStyles.qtyBtn}><Text>-</Text></View>
              <Text>1</Text>
              <View style={previewStyles.qtyBtn}><Text>+</Text></View>
            </View>
          </View>
          <Text style={previewStyles.foodPrice}>KES {food.price}</Text>
        </View>
      ))}
    </View>
  );
}

function OrdersPreview() {
  return (
    <View style={previewStyles.homeContainer}>
      <Text style={[previewStyles.title, { marginBottom: 16 }]}>My Orders</Text>
      <View style={previewStyles.orderCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontWeight: "600" }}>Order #1234</Text>
          <View style={{ backgroundColor: "#ff9800", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>Preparing</Text>
          </View>
        </View>
        <Text style={{ color: COLORS.subText, fontSize: 13, marginBottom: 8 }}>02 Jun, 6:30 PM</Text>
        {previewFoods.map((f) => (
          <View key={f.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 13 }}>{f.name} ×1</Text>
            <Text style={{ fontSize: 13 }}>KES {f.price}</Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold" }}>Total</Text>
          <Text style={{ fontWeight: "bold", color: COLORS.primary }}>KES 2,450</Text>
        </View>
      </View>
    </View>
  );
}

export default function ScreenshotsPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Store Screenshots</Text>
      <Text style={styles.pageSubtitle}>
        Take screenshots of each preview below for the Play Store listing
      </Text>

      <PhoneFrame label="Home Screen">
        <HomePreview />
      </PhoneFrame>

      <PhoneFrame label="Cart Screen">
        <CartPreview />
      </PhoneFrame>

      <PhoneFrame label="Orders Screen">
        <OrdersPreview />
      </PhoneFrame>
    </ScrollView>
  );
}

const previewStyles = StyleSheet.create({
  homeContainer: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  greeting: { fontSize: 14, color: COLORS.subText },
  title: { fontSize: 22, fontWeight: "bold" },
  searchBar: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8, marginBottom: 12,
  },
  searchText: { fontSize: 14, color: "#999" },
  chips: { marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: "#f5f5f5", marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.subText },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  card: { flexDirection: "row", backgroundColor: "#f5f5f5", borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  cardImage: { width: 80, height: 80, backgroundColor: "#ddd" },
  cardInfo: { flex: 1, padding: 10, justifyContent: "center", gap: 4 },
  foodName: { fontSize: 14, fontWeight: "600" },
  foodCategory: { fontSize: 12, color: COLORS.subText },
  foodPrice: { fontSize: 14, fontWeight: "bold", color: COLORS.primary },
  cartItem: { flexDirection: "row", backgroundColor: "#f5f5f5", borderRadius: 12, padding: 10, marginBottom: 10, gap: 10 },
  cartImage: { width: 60, height: 60, backgroundColor: "#ddd", borderRadius: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  orderCard: { backgroundColor: "#f5f5f5", borderRadius: 12, padding: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  content: { padding: 20, paddingTop: 60 },
  pageTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: COLORS.subText, textAlign: "center", marginBottom: 32 },
});
