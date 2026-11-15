import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken } from '@/lib/api';

export interface UserSummary {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'lecturer' | 'admin';
  card_code: string;
  department?: string;
  dob?: string;
  address?: string;
  card_expiry?: string;
  is_locked: boolean;
  locked_until?: string;
  is_card_valid: boolean;
  is_currently_locked: boolean;
  reservation_locked_until?: string;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identity: string, pwd: string) => Promise<UserSummary>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const res = await api.get<{ data: UserSummary }>('/profile');
      setUser(res.data.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    // Attempt silent refresh on initial application load
    const initAuth = async () => {
      try {
        const res = await api.post<{ data: { access_token: string; user: UserSummary } }>('/auth/refresh');
        setAccessToken(res.data.data.access_token);
        setUser(res.data.data.user);
      } catch {
        // Not logged in or expired cookie
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (identity: string, pwd: string): Promise<UserSummary> => {
    const res = await api.post<{ data: { access_token: string; user: UserSummary } }>('/auth/login', {
      username: identity,
      password: pwd,
    });
    const { access_token, user: loggedUser } = res.data.data;
    setAccessToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

