import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("aquaride_token") || null);
  const [user, setUser] = useState(null);

  const login = (accessToken, userInfo) => {
    localStorage.setItem("aquaride_token", accessToken);
    setToken(accessToken);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("aquaride_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
