"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { UserRank, BadgeId } from "@/models/User";

export interface UserSession {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  rank: UserRank;
  badges: BadgeId[];
  reputationPoints: number;
  commentCount: number;
  isBanned: boolean;
}

interface UserContextValue {
  user: UserSession | null;
  isLoading: boolean;
  setUser: (u: UserSession | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await fetch("/api/user/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, setUser, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
