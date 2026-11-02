import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('anemiaai_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = sessionStorage.getItem('anemiaai_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get('/auth/me');
        setUser(data.user);
        setToken(storedToken);
      } catch {
        sessionStorage.removeItem('anemiaai_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = (tokenValue, userData) => {
    sessionStorage.setItem('anemiaai_token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('anemiaai_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user && !!token;
  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, role, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;

