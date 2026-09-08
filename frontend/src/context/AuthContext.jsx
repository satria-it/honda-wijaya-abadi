import { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await adminApi.me();
        setAdmin(data);
      } catch (e) {
        localStorage.removeItem('admin_token');
      }
      setLoading(false);
    };
    check();
  }, []);

  const login = async (username, password) => {
    const data = await adminApi.login(username, password);
    localStorage.setItem('admin_token', data.token);
    setAdmin({ username: data.username });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  const updateAdmin = (username, token) => {
    if (token) localStorage.setItem('admin_token', token);
    setAdmin({ username });
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, updateAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
