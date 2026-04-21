import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  const login = useCallback((authResponse) => {
    localStorage.setItem('token', authResponse.accessToken);
    localStorage.setItem('user',  JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isAdmin  = user?.role === 'ROLE_ADMIN';
  const isSeller = user?.role === 'ROLE_SELLER';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isSeller }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
