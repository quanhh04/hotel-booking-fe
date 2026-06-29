import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

const TOKEN_KEY = "auth_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then((me) => setUser(me))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function saveTokenAndLoadUser(token) {
    localStorage.setItem(TOKEN_KEY, token);
    const me = await authApi.getMe();
    setUser(me);
  }

  async function login(email, password) {
    const { token } = await authApi.login(email, password);
    await saveTokenAndLoadUser(token);
  }

  async function register(email, password) {
    const { token } = await authApi.register(email, password);
    await saveTokenAndLoadUser(token);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
