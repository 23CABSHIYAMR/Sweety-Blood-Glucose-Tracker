import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../../shared/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('sweety_access_token') || localStorage.getItem('sweety_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Sync logout event from token interceptor
  useEffect(() => {
    const handleAutoLogout = () => {
      setAccessToken(null);
      setUser(null);
    };
    window.addEventListener('sweety_logout', handleAutoLogout);
    return () => window.removeEventListener('sweety_logout', handleAutoLogout);
  }, []);

  // Verify stored token on boot
  useEffect(() => {
    async function loadUser() {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Failed to authenticate stored token:', err);
        localStorage.removeItem('sweety_access_token');
        localStorage.removeItem('sweety_token');
        localStorage.removeItem('sweety_refresh_token');
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [accessToken]);

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const token = data.accessToken || data.token;
    localStorage.setItem('sweety_access_token', token);
    localStorage.setItem('sweety_token', token);
    if (data.refreshToken) {
      localStorage.setItem('sweety_refresh_token', data.refreshToken);
    }

    setAccessToken(token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    const token = data.accessToken || data.token;
    localStorage.setItem('sweety_access_token', token);
    localStorage.setItem('sweety_token', token);
    if (data.refreshToken) {
      localStorage.setItem('sweety_refresh_token', data.refreshToken);
    }

    setAccessToken(token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('sweety_refresh_token');
    try {
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('sweety_access_token');
      localStorage.removeItem('sweety_token');
      localStorage.removeItem('sweety_refresh_token');
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        token: accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
