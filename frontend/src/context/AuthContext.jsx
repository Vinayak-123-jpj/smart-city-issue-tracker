import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

import { issueAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
  try {
    const response = await issueAPI.post('/auth/login', { email, password });

    const { token: newToken, user: userData } = response.data.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    toast.success(`Welcome back, ${userData.name}!`);

    return { success: true };
  } catch (error) {
    toast.error(error.response?.data?.message || 'Login failed');

    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
};

const register = async (userData) => {
  try {
    const response = await issueAPI.post('/auth/register', userData);

    const { token: newToken, user: newUser } = response.data.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    toast.success('Account created successfully!');

    return { success: true };
  } catch (error) {
    toast.error(error.response?.data?.message || 'Registration failed');

    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed',
    };
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setToken(null);
  setUser(null);

  toast.success('Logged out successfully');
};


  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isCitizen: user?.role === 'citizen',
    isAuthority: user?.role === 'authority',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};