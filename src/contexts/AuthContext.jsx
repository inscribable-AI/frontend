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

  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await authAPI.signUp({ firstName, lastName, email, password });
      localStorage.setItem('email', email);
      return response;
    } catch (error) {
      throw new Error('Failed to register. Please try again.');
    }
  };

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
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};