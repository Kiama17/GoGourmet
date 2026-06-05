import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  updateProfile: (data: { display_name?: string; email?: string; phone?: string; address?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    setIsAdmin(data?.role === "admin");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAdminRole(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAdminRole(session.user.id);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const updateProfile = async (data: { display_name?: string; email?: string; phone?: string; address?: string }) => {
    if (!user) throw new Error("Not logged in");

    const updates: Record<string, string> = {};
    if (data.display_name) updates.display_name = data.display_name;
    if (data.email) updates.email = data.email;
    if (data.phone) updates.phone = data.phone;
    if (data.address) updates.address = data.address;

    const { error: userError } = await supabase.from("users").upsert(
      { id: user.id, ...updates },
      { onConflict: "id" }
    );
    if (userError) throw userError;

    const authUpdates: Record<string, any> = {};
    if (data.display_name) authUpdates.data = { ...authUpdates.data, display_name: data.display_name };
    if (data.email && data.email !== user.email) authUpdates.email = data.email;

    if (Object.keys(authUpdates).length > 0) {
      try {
        await supabase.auth.updateUser(authUpdates);
      } catch (e) {
        console.warn("Auth metadata update failed (non-fatal):", e);
      }
    }

    const { data: sessionData } = await supabase.auth.getSession();
    setUser(sessionData?.session?.user ?? null);
  };

  return (
    <AuthContext.Provider value={{ user, session, logout, loading, isAdmin, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
