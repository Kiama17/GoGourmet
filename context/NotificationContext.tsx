import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../services/supabaseClient";

type NotificationState = {
  expoPushToken: string | null;
  notification: any | null;
  permissionGranted: boolean;
  setupDone: boolean;
};

type NotificationContextType = NotificationState & {
  setupNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const setup = useCallback(async () => {
    if (setupDone) return;
    const { setupNotifications, subscribeToNotifications } = await import(
      "../services/notifications"
    );

    const token = await setupNotifications();
    if (token) {
      setExpoPushToken(token);
      setPermissionGranted(true);
      await supabase.rpc("upsert_push_token", { p_token: token });
    }

    subscribeToNotifications(
      (n: any) => setNotification(n),
    );

    setSetupDone(true);
  }, [setupDone]);

  useEffect(() => {
    setup();
  }, [setup]);

  const value = useMemo(
    () => ({
      expoPushToken,
      notification,
      permissionGranted,
      setupDone,
      setupNotifications: setup,
    }),
    [expoPushToken, notification, permissionGranted, setupDone, setup],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider",
    );
  }
  return context;
};
