import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { analytics } from "../services/analytics";

type UserProfile = {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  role: string | null;
  avatar_url: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  updateProfile: (data: { display_name?: string; email?: string; phone?: string; address?: string; avatar_url?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("display_name, email, phone, address, role, avatar_url")
      .eq("id", userId)
      .single();
    if (data) {
      setProfile(data as UserProfile);
      setIsAdmin(data.role === "admin");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setIsAdmin(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    analytics.track("user_logged_out");
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfile = async (data: { display_name?: string; email?: string; phone?: string; address?: string; avatar_url?: string }) => {
    if (!user) throw new Error("Not logged in");

    const updates: Record<string, string> = {};
    if (data.display_name) updates.display_name = data.display_name;
    if (data.email) updates.email = data.email;
    if (data.phone) updates.phone = data.phone;
    if (data.address) updates.address = data.address;
    if (data.avatar_url) updates.avatar_url = data.avatar_url;

    const { error: userError } = await supabase.from("users").upsert(
      { id: user.id, ...updates },
      { onConflict: "id" }
    );
    if (userError) throw userError;

    const meta: Record<string, string> = {};
    if (data.display_name) meta.display_name = data.display_name;
    if (data.phone) meta.phone = data.phone;
    if (data.address) meta.address = data.address;
    if (data.avatar_url) meta.avatar_url = data.avatar_url;

    const authUpdates: Record<string, any> = {};
    if (Object.keys(meta).length > 0) authUpdates.data = meta;
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
    if (user.id) fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, logout, loading, isAdmin, updateProfile }}>
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
