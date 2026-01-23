import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '@/hooks/api';
import { jwtDecode } from 'jwt-decode';
import type { User,  AuthContextType} from './index.ts';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const setAuthData = (token: string) => {
    const decoded: User = jwtDecode(token);
    setAccessToken(token);
    setUser(decoded);
    // Store in localStorage for persistence
    localStorage.setItem('access_token', token);
  };

  useEffect(() => {
    const checkAuth = async () => { 
      console.log('🔍 Checking authentication...');
      console.log('🍪 All cookies:', document.cookie);
      const hasToken = document.cookie.includes('refresh_token');
      console.log('🍪 Has refresh token:', hasToken);
      
      if (!hasToken) {
        console.log('❌ No refresh token found, skipping auth check');
        setIsInitialized(true);
        return;
      }

      try {
        console.log('🔄 Calling refresh endpoint...');
        const { data } = await api.post('/auth/refresh/'); 
        console.log('✅ Refresh successful:', data);
        setAuthData(data.access);
      } catch (error) {
        console.error('❌ Refresh failed:', error);
        // Clear invalid auth data
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('access_token');
        // Clear the invalid cookie
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } finally {
        setIsInitialized(true);
        console.log('✅ Auth initialization complete');
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
    localStorage.removeItem('access_token');
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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


