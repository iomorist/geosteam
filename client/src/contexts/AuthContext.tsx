import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export interface AuthUser {
  id: number;
  email: string;
  displayName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.withCredentials = true;

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    const res = await axios.get('/api/auth/me');
    setUser(res.data.user);
  };

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setUser(res.data.user);
  };

  const register = async (email: string, password: string, displayName?: string, firstName?: string, lastName?: string) => {
    const res = await axios.post('/api/auth/register', { email, password, displayName, firstName, lastName });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  useEffect(() => {
    refreshMe()
      .catch(() => {
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
    refreshMe
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

