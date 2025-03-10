import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('jwt', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('jwt');
      await authAPI.signOut(token); // Ensure this function is correctly implemented
      localStorage.removeItem('jwt');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Optionally, handle the error by showing a message to the user
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};