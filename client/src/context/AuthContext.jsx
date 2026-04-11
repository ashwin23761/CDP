import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipFetchRef = useRef(false);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('cdp_token');
      if (token && !skipFetchRef.current) {
        try {
          const response = await getCurrentUser();
          if (response.success) {
            setUser(response.data);
          } else {
            localStorage.removeItem('cdp_token');
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('cdp_token');
        }
      }
      skipFetchRef.current = false;
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (userData, userToken) => {
    localStorage.setItem('cdp_token', userToken);
    skipFetchRef.current = true;
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('cdp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
