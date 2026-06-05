import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthSession } from "./types";
import * as api from "./api";

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  refreshSession: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const s = await api.getSession();
      setSession(s);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signInHandler = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const result = await api.signIn(email, password);
      if (result.data) {
        setSession(result.data);
        return {};
      }
      return { error: result.error || "Sign in failed" };
    },
    []
  );

  const signUpHandler = useCallback(
    async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
      const result = await api.signUp(email, password, name);
      if (result.data) {
        setSession(result.data);
        return {};
      }
      return { error: result.error || "Registration failed" };
    },
    []
  );

  const signOutHandler = useCallback(async () => {
    await api.signOut();
    setSession(null);
  }, []);

  const value: AuthContextType = {
    session,
    isLoading,
    isAuthenticated: !!session?.user && !!session?.session,
    signIn: signInHandler,
    signUp: signUpHandler,
    signOut: signOutHandler,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
