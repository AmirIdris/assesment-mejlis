import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import type { User } from '@repo/shared-types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.auth.me();
      setUser({
        ...response.user,
        role: response.user.role as 'ADMIN' | 'USER',
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch user on client side
    if (typeof window !== 'undefined') {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    setUser({
      ...response.user,
      role: response.user.role as 'ADMIN' | 'USER',
    });
  };

  const signup = async (email: string, password: string) => {
    const response = await api.auth.signup(email, password);
    setUser({
      ...response.user,
      role: response.user.role as 'ADMIN' | 'USER',
    });
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

