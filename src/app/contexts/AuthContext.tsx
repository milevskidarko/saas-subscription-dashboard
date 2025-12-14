'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Subscription } from '../../lib/types';
import { createSubscription, getSubscriptionStatus } from '../../lib/subscription';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  subscription?: Subscription;
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
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        subscription: {
          id: 'sub_admin_001',
          userId: '1',
          plan: 'enterprise',
          status: 'active',
          startDate: new Date('2024-01-01'),
          trialEndDate: new Date('2024-01-08'),
          endDate: new Date('2025-01-01'),
          autoRenew: true,
          price: 99.99,
          currency: 'USD',
        },
      },
    },
    'user@example.com': {
      password: 'userpass',
      user: {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        subscription: createSubscription('2', 'premium', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // Started 3 days ago
      },
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
