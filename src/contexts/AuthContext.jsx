/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi";

const TOKEN_KEY = "auth_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify existing token
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((res) => setUser(res.data ?? res))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    const token = res.data?.token ?? res.token;
    localStorage.setItem(TOKEN_KEY, token);
    const me = await authApi.getMe();
    setUser(me.data ?? me);
  }, []);

  const register = useCallback(async (email, password) => {
    const res = await authApi.register(email, password);
    const token = res.data?.token ?? res.token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    // Auto login after register
    const loginRes = await authApi.login(email, password);
    const loginToken = loginRes.data?.token ?? loginRes.token;
    localStorage.setItem(TOKEN_KEY, loginToken);
    const me = await authApi.getMe();
    setUser(me.data ?? me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
