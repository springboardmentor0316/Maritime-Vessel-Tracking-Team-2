import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("access");

      if (token) {
        const decoded = jwtDecode(token);

        setUser({
          email: decoded.email,
          role: decoded.role,
        });

        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIXED LOGIN FUNCTION
  const login = (tokens) => {
    if (!tokens?.access) {
      console.error("Invalid login response: no access token");
      return;
    }

    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);

    const decoded = jwtDecode(tokens.access);

    setUser({
      email: decoded.email,
      role: decoded.role,
    });

    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
