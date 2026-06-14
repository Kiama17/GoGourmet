import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useOrders } from "../../context/OrdersContext";
import { useApp } from "../../hooks/useApp";
import { getUserReviewForOrder, submitReview } from "../../services/reviews";
import { sanitize } from "../../utils/sanitize";

const statusColors: Record<string, string> = {
  Pending: "#ff9800",
  Preparing: "#2196f3",
  Delivered: "#4caf50",
  Cancelled: "#f44336",
};

export default function OrdersScreen() {
  const { orders, cancelOrder, fetchOrders, loading } = useOrders();
  const { colors, t } = useApp();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = (id: string) => {
    Alert.alert(t("common.cancel"), "Are you sure you want to cancel this order?", [
      { text: t("common.cancel"), style: "cancel" },
      { text: "Yes, Cancel", style: "destructive", onPress: async () => {
        setCancellingId(id);
        try { await cancelOrder(id); } catch { Alert.alert("Error", "Failed to cancel order. Please try again."); }
        setCancellingId(null);
      }},
    ]);
  };

  const openReview = async (orderId: string) => {
    const existing = await getUserReviewForOrder(orderId);
    if (existing) { Alert.alert("Review", "You already reviewed this order"); return; }
    setReviewOrderId(orderId);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewOrderId || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      const order = orders.find((o) => o.id === reviewOrderId);
      if (order) {
        for (const item of order.items) {
          await submitReview({ menuItemId: item.id, orderId: reviewOrderId, rating: reviewRating, comment: reviewComment });
        }
      }
      Alert.alert("Thank you!", "Your review has been submitted.");
      setReviewOrderId(null);
    } catch { Alert.alert("Error", "Failed to submit review. Please try again."); }
    setReviewSubmitting(false);
  };

  if (loading && orders.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("orders.title")}</Text>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={60} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("orders.empty")}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subText }]}>{t("orders.emptySubtitle")}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Animated.View style={[styles.card, { backgroundColor: colors.card, opacity: fadeAnim }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.orderId, { color: colors.text }]}>#{item.id.slice(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || colors.subText }]}>
                  <Text style={styles.statusText}>{t(`orders.${item.status.toLowerCase()}`, { defaultValue: item.status })}</Text>
                </View>
              </View>
              <Text style={[styles.date, { color: colors.subText }]}>{item.date}</Text>
              {item.items.map((food: any) => (
                <View key={food.id} style={styles.item}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{food.name} ×{food.quantity}</Text>
                  <Text style={[styles.itemPrice, { color: colors.subText }]}>KES {food.price * food.quantity}</Text>
                </View>
              ))}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                <Text style={[styles.total, { color: colors.primary }]}>KES {item.total}</Text>
              </View>
              {item.status !== "Cancelled" && item.status !== "Delivered" && (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.danger }]}
                  onPress={() => handleCancel(item.id)}
                  disabled={cancellingId === item.id}
                  accessibilityLabel={t("orders.cancel", { id: item.id.slice(0, 8) })}
                  accessibilityRole="button"
                >
                  {cancellingId === item.id ? <LoadingSpinner size="small" color={colors.danger} /> : <Text style={[styles.cancelText, { color: colors.danger }]}>{t("common.cancel")}</Text>}
                </TouchableOpacity>
              )}
              {item.status === "Delivered" && (
                <TouchableOpacity style={[styles.reviewButton, { borderColor: colors.primary }]} onPress={() => openReview(item.id)} accessibilityLabel="Review order" accessibilityRole="button">
                  <Ionicons name="star-outline" size={16} color={colors.primary} />
                  <Text style={[styles.reviewText, { color: colors.primary }]}>Rate & Review</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        />
      )}

      {reviewOrderId && (
        <View style={[styles.reviewOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.reviewCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Rate your order</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)} accessibilityLabel={`${star} star`} accessibilityRole="button">
                  <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={36} color="#ffc107" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder="Add a comment (optional)" value={reviewComment} onChangeText={(v) => setReviewComment(sanitize(v))} multiline style={[styles.reviewInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.subText} />
            <TouchableOpacity style={[styles.submitReviewButton, { backgroundColor: colors.primary }]} onPress={handleSubmitReview} disabled={reviewSubmitting || reviewRating === 0} accessibilityLabel="Submit review" accessibilityRole="button">
              {reviewSubmitting ? <LoadingSpinner size="small" color="#fff" /> : <Text style={styles.submitReviewText}>Submit</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReviewOrderId(null)} accessibilityLabel="Close review" accessibilityRole="button">
              <Text style={[styles.closeReviewText, { color: colors.subText }]}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 30, fontWeight: "bold", marginTop: 10, marginBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "bold" },
  emptySubtitle: { fontSize: 15, textAlign: "center", paddingHorizontal: 40 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  orderId: { fontSize: 15, fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  date: { fontSize: 13, marginBottom: 12 },
  item: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  itemName: { fontSize: 14 },
  itemPrice: { fontSize: 14 },
  divider: { height: 1, marginVertical: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  total: { fontSize: 18, fontWeight: "bold" },
  cancelButton: { borderWidth: 1.5, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 12 },
  cancelText: { fontSize: 15, fontWeight: "600" },
  reviewButton: { flexDirection: "row", borderWidth: 1.5, borderRadius: 10, padding: 12, alignItems: "center", justifyContent: "center", marginTop: 12, gap: 6 },
  reviewText: { fontSize: 14, fontWeight: "600" },
  reviewOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", padding: 30 },
  reviewCard: { borderRadius: 20, padding: 24, width: "100%", alignItems: "center", gap: 16 },
  reviewTitle: { fontSize: 20, fontWeight: "bold" },
  starRow: { flexDirection: "row", gap: 8 },
  reviewInput: { width: "100%", minHeight: 80, borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, textAlignVertical: "top" },
  submitReviewButton: { width: "100%", padding: 14, borderRadius: 12, alignItems: "center" },
  submitReviewText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  closeReviewText: { fontSize: 15, fontWeight: "500" },
});
