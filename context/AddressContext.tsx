import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

export type SavedAddress = {
  id: string;
  user_id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  apartment?: string;
  instructions?: string;
  is_default: boolean;
  created_at: string;
};

type AddressContextType = {
  addresses: SavedAddress[];
  loading: boolean;
  fetchAddresses: () => Promise<void>;
  saveAddress: (addr: Omit<SavedAddress, "id" | "user_id" | "created_at">) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Omit<SavedAddress, "id" | "user_id" | "created_at">>) => Promise<void>;
};

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setAddresses((data as SavedAddress[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const saveAddress = async (addr: Omit<SavedAddress, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    if (addr.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    }
    const { error } = await supabase.from("addresses").insert({
      ...addr,
      user_id: user.id,
    });
    if (error) throw error;
    await fetchAddresses();
  };

  const updateAddress = async (id: string, updates: Partial<Omit<SavedAddress, "id" | "user_id" | "created_at">>) => {
    const { error } = await supabase.from("addresses").update(updates).eq("id", id);
    if (error) throw error;
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) throw error;
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await fetchAddresses();
  };

  return (
    <AddressContext.Provider value={{ addresses, loading, fetchAddresses, saveAddress, deleteAddress, setDefault, updateAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (!context) throw new Error("useAddresses must be used inside AddressProvider");
  return context;
};
