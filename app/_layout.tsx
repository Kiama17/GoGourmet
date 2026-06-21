import Constants from "expo-constants";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

const sentryDsn =
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  ((Constants as any).expoConfig?.extra?.sentryDsn as string) ||
  ((Constants as any).manifest?.extra?.sentryDsn as string) ||
  "";
import { AddressProvider } from "../context/AddressContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { LanguageProvider } from "../context/LanguageContext";
import { NetworkProvider } from "../context/NetworkContext";
import { NotificationProvider } from "../context/NotificationContext";
import { OrdersProvider } from "../context/OrdersContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import ErrorBoundary from "../components/ErrorBoundary";
import OfflineBanner from "../components/OfflineBanner";

export default function RootLayout() {
  useEffect(() => {
    if (sentryDsn) {
      import("sentry-expo")
        .then((Sentry) => {
          Sentry.init({
            dsn: sentryDsn,
            tracesSampleRate: 0.2,
            enableInExpoDevelopment: true,
          });
        })
        .catch(() => {
          /* sentry-expo not available on this platform */
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <NetworkProvider>
              <AuthProvider>
                <CartProvider>
                  <OrdersProvider>
                    <FavoritesProvider>
                      <AddressProvider>
                        <NotificationProvider>
                          <StatusBar style="auto" />
                          <OfflineBanner />
                          <Slot />
                        </NotificationProvider>
                      </AddressProvider>
                    </FavoritesProvider>
                  </OrdersProvider>
                </CartProvider>
              </AuthProvider>
            </NetworkProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}