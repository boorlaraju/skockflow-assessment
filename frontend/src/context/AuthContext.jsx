import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stockflow_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('stockflow_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (values) => {
    const { data } = await api.post('/auth/login', values);
    localStorage.setItem('stockflow_token', data.token);
    setUser(data.user);
  };
  const register = async (values) => {
    const { data } = await api.post('/auth/register', values);
    localStorage.setItem('stockflow_token', data.token);
    setUser(data.user);
  };
  const logout = () => { localStorage.removeItem('stockflow_token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
