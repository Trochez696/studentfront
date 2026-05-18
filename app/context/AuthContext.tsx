import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:3000';
const SESSION_KEY = 'studentfront_session';

type User = {
  id: number;
  nombre: string;
  email: string;
  role: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (!stored) {
          return;
        }
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token);
          setUser(parsed.user);
        }
      } catch {
        // ignore restore failures
      }
    };

    restoreSession();
  }, []);

  const saveSession = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token: newToken, user: newUser }));
  };

  const clearSession = async () => {
    setToken(null);
    setUser(null);
    setError(null);
    await SecureStore.deleteItemAsync(SESSION_KEY);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.message || 'Error en el login';
        throw new Error(message);
      }

      const result = await response.json();
      if (!result.access_token || !result.user) {
        throw new Error('Respuesta inválida del servidor');
      }
      await saveSession(result.access_token, result.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    void clearSession();
  };

  const value = useMemo(
    () => ({ token, user, error, login, logout }),
    [token, user, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
