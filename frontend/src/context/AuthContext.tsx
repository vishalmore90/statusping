"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { apiClient } from "@/lib/api";
import { getToken, setToken, clearToken } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user?: User) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getToken()));

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>("/auth/me");
      setUser(response.data);
    } catch {
      clearToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (token) {
      apiClient
        .get<User>("/auth/me")
        .then((response) => {
          if (isMounted) setUser(response.data);
        })
        .catch(() => {
          if (isMounted) {
            clearToken();
            setTokenState(null);
            setUser(null);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (newToken: string, initialUser?: User) => {
    setToken(newToken);
    setTokenState(newToken);
    if (initialUser) {
      setUser(initialUser);
      setIsLoading(false);
    } else {
      await fetchCurrentUser();
    }
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
