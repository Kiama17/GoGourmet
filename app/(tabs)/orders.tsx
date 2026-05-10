import { FlatList, StyleSheet, Text, View } from "react-native";

const orders = [
  {
    id: "1",
    food: "Burger Combo",
    total: 1200,
    status: "Delivered",
    date: "10 May 2026",
  },

  {
    id: "2",
    food: "Pizza",
    total: 1500,
    status: "Preparing",
    date: "9 May 2026",
  },

  {
    id: "3",
    food: "Fries & Soda",
    total: 600,
    status: "On the way",
    date: "8 May 2026",
  },
];

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.food}>{item.food}</Text>

            <Text style={styles.total}>Ksh {item.total}</Text>

            <Text style={styles.status}>Status: {item.status}</Text>

            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },

  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
  },

  food: {
    fontSize: 20,
    fontWeight: "bold",
  },

  total: {
    fontSize: 18,
    color: "#ff6b00",
    marginTop: 8,
  },

  status: {
    fontSize: 16,
    marginTop: 8,
  },

  date: {
    fontSize: 14,
    color: "gray",
    marginTop: 8,
  },
});
