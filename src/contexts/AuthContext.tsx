import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppUser } from '../types';
import * as api from '../utils/api';

interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  login: (pinCode: string) => Promise<boolean>;
  logout: () => void;
  isOwner: boolean;
  isWorker: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = currentUser !== null;
  const isOwner = currentUser?.role === 'owner';
  const isWorker = currentUser?.role === 'worker';

  const login = async (pinCode: string): Promise<boolean> => {
    try {
      const user = await api.getUserByPin(pinCode);
      if (!user) return false;
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeBranchId');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, isOwner, isWorker }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
