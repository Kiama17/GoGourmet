import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../styles/colors";

import EmptyState from "../../components/EmptyState";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/admin";

const categories = ["Burger", "Pizza", "Wraps", "Fries", "Drinks", "Local"];
const PAGE_SIZE = 10;

export default function AdminMenuScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Local",
    description: "",
    image_url: "",
    rating: "",
    stock_quantity: "",
  });

  useEffect(() => {
    loadItems(1);
  }, []);

  const loadItems = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      setError("");
      const data = await getAllMenuItems(pageNum, PAGE_SIZE);
      if (pageNum === 1) {
        setItems(data);
      } else {
        setItems((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      setError("Failed to load menu items");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadItems(nextPage);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", price: "", category: "Local", description: "", image_url: "", rating: "", stock_quantity: "" });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      price: String(item.price || ""),
      category: item.category || "Local",
      description: item.description || "",
      image_url: item.image_url || "",
      rating: String(item.rating || ""),
      stock_quantity: item.stock_quantity != null ? String(item.stock_quantity) : "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert("Validation", "Name and price are required");
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Validation", "Enter a valid price");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price,
        category: form.category,
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        rating: form.rating ? parseFloat(form.rating) : undefined,
        stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity, 10) : undefined,
      };
      if (editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await createMenuItem(payload);
      }
      setModalVisible(false);
      await loadItems();
    } catch {
      Alert.alert("Error", "Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenuItem(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete item");
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return <ErrorMessage title="Menu Error" message={error} onRetry={loadItems} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="restaurant-outline" title="No menu items" subtitle="Create your first menu item" />
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity style={styles.loadMore} onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          ) : items.length > 0 ? (
            <Text style={styles.endText}>All items loaded</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color="#ccc" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemPrice}>KES {item.price}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "Edit Item" : "New Item"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
              placeholder="Item name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Price (KES)</Text>
            <TextInput
              style={styles.input}
              value={form.price}
              onChangeText={(t) => setForm((p) => ({ ...p, price: t }))}
              placeholder="e.g. 850"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, form.category === cat && styles.categoryChipActive]}
                  onPress={() => setForm((p) => ({ ...p, category: cat }))}
                >
                  <Text style={[styles.categoryChipText, form.category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
              placeholder="Describe the item"
              multiline
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={form.image_url}
              onChangeText={(t) => setForm((p) => ({ ...p, image_url: t }))}
              placeholder="https://..."
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Rating (0-5)</Text>
            <TextInput
              style={styles.input}
              value={form.rating}
              onChangeText={(t) => setForm((p) => ({ ...p, rating: t }))}
              placeholder="e.g. 4.5"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              value={form.stock_quantity}
              onChangeText={(t) => setForm((p) => ({ ...p, stock_quantity: t }))}
              placeholder="e.g. 50"
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 30, gap: 16 },
  errorText: { fontSize: 16, color: COLORS.danger, textAlign: "center" },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  image: { width: 70, height: 70, borderRadius: 12 },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 16, fontWeight: "bold" },
  itemCategory: { fontSize: 13, color: COLORS.subText, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: "600", color: COLORS.primary, marginTop: 4 },
  cardActions: { gap: 8 },
  editBtn: { padding: 8 },
  deleteBtn: { padding: 8 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold" },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryChipText: { fontSize: 14, color: COLORS.text },
  categoryChipTextActive: { color: "#fff" },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  saveBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  loadMore: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 8,
  },
  loadMoreText: { color: COLORS.primary, fontSize: 15, fontWeight: "600" },
  endText: { textAlign: "center", color: COLORS.subText, fontSize: 13, paddingVertical: 16 },
});
