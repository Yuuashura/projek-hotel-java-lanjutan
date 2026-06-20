/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const loading = false;

  // Log in a user and save session to local storage
  const login = (tokenStr, userData) => {
    localStorage.setItem('token', tokenStr);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
  };

  // Log out a user and clear session
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Fetch latest profile information from API Gateway
  const refreshProfile = async () => {
    try {
      const response = await api.get('/api/users/me');
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Gagal memperbarui data profil:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
