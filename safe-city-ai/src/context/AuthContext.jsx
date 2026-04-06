import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:8888/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');

      // Admin direct login — no MFA/OTP, set auth state immediately
      if (data.role === 'admin' && !data.needs_mfa && !data.needs_otp) {
        const userData = {
          email: credentials.email || 'admin@safecity.ai',
          role: 'admin',
          name: 'Administrator',
          token: 'admin_direct_token',
        };
        setUser(userData);
        setIsAuthenticated(true);
      }

      return data; // needs_mfa | needs_otp | direct
    } catch (err) {
      throw err;
    }
  };

  const verifySecurity = async (verificationData) => {
    try {
      const response = await fetch('http://localhost:8888/auth/verify-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Verification failed');

      const userData = {
        email: verificationData.email,
        role: data.role,
        token: data.token,
        id: data.userId,
        name: verificationData.officer_name || verificationData.email,
      };
      setUser(userData);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Direct setter used for police verify (officer name stored)
  const loginDirect = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, verifySecurity, loginDirect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
