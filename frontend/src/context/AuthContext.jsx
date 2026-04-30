import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
            try {
              const { data } = await axios.get(`${API_URL}/api/users/profile`);
              setUser({ ...data, token: parsed.token });
            } catch (err) {
              console.error('Failed to fetch user profile:', err);
              localStorage.removeItem('userInfo');
              delete axios.defaults.headers.common['Authorization'];
            }
          }
        } catch (e) {
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password });
      setUser(data);
      // Only store token in local storage
      localStorage.setItem('userInfo', JSON.stringify({ token: data.token }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
