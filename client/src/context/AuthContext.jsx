import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wf_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      setError(null);
      const { data } = await api.post('/api/auth/login', { email, password, role });
      setToken(data.token);
      localStorage.setItem('wf_token', data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await api.post('/api/auth/register', userData);
      // We don't automatically log them in anymore since they are pending HR approval
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    if (user && user.role) {
      localStorage.setItem('wf_last_role', user.role);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('wf_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/api/auth/forgotpassword', { email });
      return data;
    } catch (err) {
      throw err;
    }
  };

  const resetPassword = async (email, otp, password) => {
    try {
      const { data } = await api.post('/api/auth/resetpassword', { email, otp, password });
      return data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      forgotPassword,
      resetPassword,
      logout, 
      clearError: () => setError(null) 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
