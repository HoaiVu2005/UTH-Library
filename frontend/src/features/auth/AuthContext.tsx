import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken, getAccessToken, setRefreshToken, getRefreshToken } from '@/lib/api';

export interface UserSummary {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'lecturer' | 'librarian' | 'admin';
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

const getStoredUser = (): UserSummary | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('uth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hasSession = localStorage.getItem('uth_has_session') === 'true';
      const storedToken = localStorage.getItem('uth_access_token');
      // If session and token already exist in localStorage, ready immediately (no loading flash on F5)
      if (hasSession && storedToken) return false;
    }
    return true;
  });

  const refreshProfile = async () => {
    try {
      const res = await api.get<{ data: UserSummary }>('/profile');
      setUser(res.data.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('uth_has_session', 'true');
        localStorage.setItem('uth_user', JSON.stringify(res.data.data));
      }
    } catch {
      // If profile fails, check if refresh token can recover it
      try {
        const fallbackRefreshToken = getRefreshToken();
        const refreshRes = await api.post<{
          data: { access_token: string; refresh_token?: string; user: UserSummary };
        }>('/auth/refresh', fallbackRefreshToken ? { refresh_token: fallbackRefreshToken } : {});
        setAccessToken(refreshRes.data.data.access_token);
        if (refreshRes.data.data.refresh_token) {
          setRefreshToken(refreshRes.data.data.refresh_token);
        }
        setUser(refreshRes.data.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('uth_has_session', 'true');
          localStorage.setItem('uth_user', JSON.stringify(refreshRes.data.data.user));
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('uth_has_session');
          localStorage.removeItem('uth_user');
        }
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');
      const hasSession = typeof window !== 'undefined' && localStorage.getItem('uth_has_session') === 'true';

      if (isLoginPage || !hasSession) {
        setIsLoading(false);
        return;
      }

      // If we already have stored token, synchronously validate in background
      const storedToken = getAccessToken();
      if (storedToken) {
        setIsLoading(false);
        try {
          const res = await api.get<{ data: UserSummary }>('/profile');
          setUser(res.data.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('uth_user', JSON.stringify(res.data.data));
          }
        } catch {
          // If profile fails (e.g. access token expired), perform silent refresh
          try {
            const fallbackRefreshToken = getRefreshToken();
            const refreshRes = await api.post<{
              data: { access_token: string; refresh_token?: string; user: UserSummary };
            }>('/auth/refresh', fallbackRefreshToken ? { refresh_token: fallbackRefreshToken } : {});
            setAccessToken(refreshRes.data.data.access_token);
            if (refreshRes.data.data.refresh_token) {
              setRefreshToken(refreshRes.data.data.refresh_token);
            }
            setUser(refreshRes.data.data.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('uth_user', JSON.stringify(refreshRes.data.data.user));
            }
          } catch {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('uth_has_session');
              localStorage.removeItem('uth_user');
            }
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
          }
        }
        return;
      }

      // If no access token in localStorage, attempt silent refresh via cookie / stored refresh token
      try {
        const fallbackRefreshToken = getRefreshToken();
        const res = await api.post<{
          data: { access_token: string; refresh_token?: string; user: UserSummary };
        }>('/auth/refresh', fallbackRefreshToken ? { refresh_token: fallbackRefreshToken } : {});
        setAccessToken(res.data.data.access_token);
        if (res.data.data.refresh_token) {
          setRefreshToken(res.data.data.refresh_token);
        }
        setUser(res.data.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('uth_has_session', 'true');
          localStorage.setItem('uth_user', JSON.stringify(res.data.data.user));
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('uth_has_session');
          localStorage.removeItem('uth_user');
        }
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identity: string, pwd: string): Promise<UserSummary> => {
    const res = await api.post<{
      data: { access_token: string; refresh_token?: string; user: UserSummary };
    }>('/auth/login', {
      username: identity,
      password: pwd,
    });
    const { access_token, refresh_token, user: loggedUser } = res.data.data;
    setAccessToken(access_token);
    if (refresh_token) {
      setRefreshToken(refresh_token);
    }
    setUser(loggedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('uth_has_session', 'true');
      localStorage.setItem('uth_user', JSON.stringify(loggedUser));
    }
    return loggedUser;
  };

  const logout = async () => {
    try {
      const fallbackRefreshToken = getRefreshToken();
      await api.post('/auth/logout', fallbackRefreshToken ? { refresh_token: fallbackRefreshToken } : {});
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('uth_has_session');
        localStorage.removeItem('uth_user');
      }
      setAccessToken(null);
      setRefreshToken(null);
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

