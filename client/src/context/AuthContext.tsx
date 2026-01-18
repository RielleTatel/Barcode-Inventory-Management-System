import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '@/components/ui/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  user_id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isInitialized: boolean; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const setAuthData = (token: string) => {
    const decoded: User = jwtDecode(token);
    setAccessToken(token);
    setUser(decoded);
  };

  useEffect(() => {

    const checkAuth = async () => {
      try {
        const { data } = await api.post('/accounts/refresh/'); 
        setAuthData(data.access);
      } catch (error) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsInitialized(true);
      }
    };
    checkAuth();
  }, []);

  const login = (token: string) => {
    setAuthData(token);
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};


