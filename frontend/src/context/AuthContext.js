import React, { createContext, useContext, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import api from '../services/api';
import { auth, googleProvider, firebaseReady } from '../config/firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('medirun_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('medirun_token', data.token);
      localStorage.setItem('medirun_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('medirun_token', data.token);
      localStorage.setItem('medirun_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally { setLoading(false); }
  };

  const loginWithGoogle = async () => {
    if (!firebaseReady) return { success: false, message: 'Google sign-in is not configured yet. See README for Firebase setup steps.' };
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const idToken = await result.user.getIdToken();
      const { data } = await api.post('/auth/google', { idToken });
      
      localStorage.setItem('medirun_token', data.token);
      localStorage.setItem('medirun_user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true, isNewUser: data.isNewUser };
      
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return { success: false, message: '' };
      return { success: false, message: err.response?.data?.message || 'Google sign-in failed' };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('medirun_token');
    localStorage.removeItem('medirun_user');
    localStorage.removeItem('medirun_cart');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};