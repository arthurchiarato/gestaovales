"use client";

import type { User } from '@/lib/definitions';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<User | null> {
  // This function would typically make an API call to /api/auth/session or similar
  // For now, we'll rely on the initial server-side check and allow client to update if needed
  // This is a simplified approach for client-side access to user data
  // In a full server-component architecture, this might be less necessary
  try {
    const res = await fetch('/api/auth/session');
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (error) {
    console.error("Error fetching current user:", error);
  }
  return null;
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    const user = await fetchCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (user: User) => {
    setCurrentUser(user);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      // Call the API route to clear the session cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
      // Proceed with client-side logout even if API call fails
    } finally {
      setCurrentUser(null);
      router.push('/login');
    }
  };
  

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
