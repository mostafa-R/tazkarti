import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const registerOrganizer = async (organizerData) => {
    try {
      const response = await authAPI.registerOrganizer(organizerData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Organizer registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Organizer registration failed' 
      };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await authAPI.verifyEmail(email, code);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Email verification failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const isOrganizer = () => user?.role === 'organizer';
  const isAdmin = () => user?.role === 'admin';
  const isUser = () => user?.role === 'user';

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    registerOrganizer,
    verifyEmail,
    logout,
    isOrganizer,
    isAdmin,
    isUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
