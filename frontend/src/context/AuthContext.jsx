import React, { createContext, useContext, useState, useEffect } from 'react';
import { GetUserQuery } from '../api/user';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const data = GetUserQuery();

  useEffect(() => {
    if (data.isSuccess) {
      setUser(data.data);
    }
  }, [data.data]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 