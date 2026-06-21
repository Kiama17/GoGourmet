import React, { createContext, useContext, useEffect, useState } from "react";

interface NetworkContextType {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isConnected: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const NetInfo = await import("@react-native-community/netinfo");
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected ?? true);
        unsub = NetInfo.addEventListener((s: any) => {
          setIsConnected(s.isConnected ?? true);
        });
      } catch {
        // @react-native-community/netinfo not available on web
        setIsConnected(true);
      }
    })();

    return () => unsub?.();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error("useNetwork must be used within NetworkProvider");
  return context;
}
