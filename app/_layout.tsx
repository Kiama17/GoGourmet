import { Stack } from "expo-router";
import { AddressProvider } from "../context/AddressContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { NotificationProvider } from "../context/NotificationContext";
import { OrdersProvider } from "../context/OrdersContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FavoritesProvider>
          <CartProvider>
            <OrdersProvider>
              <AddressProvider>
                <Stack screenOptions={{ animation: "slide_from_right" }} />
              </AddressProvider>
            </OrdersProvider>
          </CartProvider>
        </FavoritesProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
