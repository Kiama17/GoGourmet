import Constants from "expo-constants";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || (Constants.expoConfig?.extra?.sentryDsn as string) || "",
  tracesSampleRate: 0.2,
  enableInExpoDevelopment: true,
});
import { AddressProvider } from "../context/AddressContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { NotificationProvider } from "../context/NotificationContext";
import { OrdersProvider } from "../context/OrdersContext";
import { ToastProvider } from "../context/ToastContext";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ToastProvider>
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
      </ToastProvider>
    </ErrorBoundary>
  );
}