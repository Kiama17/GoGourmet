import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AddressProvider } from "../context/AddressContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { NotificationProvider } from "../context/NotificationContext";
import { OrdersProvider } from "../context/OrdersContext";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <OrdersProvider>
            <FavoritesProvider>
              <AddressProvider>
                <NotificationProvider>
                  <StatusBar style="dark" />
                  <Slot />
                </NotificationProvider>
              </AddressProvider>
            </FavoritesProvider>
          </OrdersProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}