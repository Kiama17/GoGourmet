import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../styles/colors";

export type PaymentMethod = "cod" | "mpesa";

type Props = {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  total: number;
};

const methods: {
  key: PaymentMethod;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: "cod",
    label: "Cash on Delivery",
    description: "Pay with cash when your order arrives",
    icon: "cash-outline",
  },
  {
    key: "mpesa",
    label: "M-Pesa",
    description: "Pay instantly via M-Pesa STK Push",
    icon: "phone-portrait-outline",
  },
];

export default function PaymentMethodSelector({ selected, onSelect, total }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      {methods.map((method) => (
        <TouchableOpacity
          key={method.key}
          style={[styles.card, selected === method.key && styles.selectedCard]}
          onPress={() => onSelect(method.key)}
          activeOpacity={0.7}
        >
          <View style={styles.radioOuter}>
            {selected === method.key && <View style={styles.radioInner} />}
          </View>
          <Ionicons name={method.icon} size={24} color={COLORS.primary} />
          <View style={styles.info}>
            <Text style={styles.label}>{method.label}</Text>
            <Text style={styles.description}>{method.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: "#fff6e5",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  info: { flex: 1 },
  label: { fontSize: 16, fontWeight: "600" },
  description: { fontSize: 13, color: COLORS.subText, marginTop: 2 },
});
