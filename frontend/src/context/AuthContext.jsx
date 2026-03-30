import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../services/auth';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        showWelcomeNotification(userData.name);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const showWelcomeNotification = (name) => {
    toast.success(`Welcome back, ${name}! 👋`, {
      duration: 5000,
      icon: '🎉',
    });
  };

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      // Store token in localStorage for requests
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success(`Welcome, ${data.user.name}! 🎉`, {
        duration: 5000,
        icon: '👋',
      });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid email or password');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    toast(notification.message, {
      icon: notification.icon || '🔔',
      duration: 4000,
    });
  };

  const value = {
    user,
    login,
    logout,
    loading,
    notifications,
    addNotification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};