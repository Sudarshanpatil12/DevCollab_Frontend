import { createContext, useState, useEffect } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('devcollab_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data);
    } catch {
      localStorage.removeItem('devcollab_token');
      localStorage.removeItem('devcollab_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('devcollab_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
  };

  const register = async (name, email, password, role = 'Developer', options = {}) => {
    const { data } = await authApi.register({ name, email, password, role });
    if (options.redirectToLogin) {
      return;
    }
    localStorage.setItem('devcollab_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
  };

  const logout = () => {
    localStorage.removeItem('devcollab_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
