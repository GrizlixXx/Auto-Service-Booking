import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function sanitizeUserData(userData) {
  if (!userData) return null;
  const cleaned = { ...userData };
  if (
    cleaned.avatar_url &&
    (cleaned.avatar_url.includes('default') || cleaned.avatar_url.includes('profilesPhotos'))
  ) {
    cleaned.avatar_url = null;
  }
  if (
    cleaned.profilePhoto &&
    (cleaned.profilePhoto.includes('default') || cleaned.profilePhoto.includes('profilesPhotos'))
  ) {
    cleaned.profilePhoto = null;
  }
  return cleaned;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('autofix_user');
    const token = localStorage.getItem('autofix_token');
    if (storedUser && token) {
      try {
        const parsed = sanitizeUserData(JSON.parse(storedUser));
        localStorage.setItem('autofix_user', JSON.stringify(parsed));
        setUser(parsed);
      } catch {
        localStorage.removeItem('autofix_user');
        localStorage.removeItem('autofix_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    const cleanUser = sanitizeUserData(userData);
    localStorage.setItem('autofix_token', token);
    localStorage.setItem('autofix_user', JSON.stringify(cleanUser));
    setUser(cleanUser);
  };

  const logout = () => {
    localStorage.removeItem('autofix_token');
    localStorage.removeItem('autofix_user');
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const updated = sanitizeUserData({ ...prev, ...updatedFields });
      localStorage.setItem('autofix_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = !!user;

  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
