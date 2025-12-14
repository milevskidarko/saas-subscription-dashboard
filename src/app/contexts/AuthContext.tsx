'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockUsers: Record<string, { password: string; user: User }> = {
    'admin@example.com': {
      password: 'adminpass',
      user: { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    },
    'user@example.com': {
      password: 'userpass',
      user: { id: '2', name: 'Regular User', email: 'user@example.com', role: 'user' },
    },
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
