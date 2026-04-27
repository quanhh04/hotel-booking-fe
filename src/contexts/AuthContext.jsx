/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

/**
 * AuthContext — Quản lý trạng thái đăng nhập GLOBAL cho cả app.
 *
 * Nguyên tắc:
 *   - Token JWT lưu trong localStorage (key = "auth_token") để giữ giữa các lần mở app.
 *   - Khi app khởi động: nếu có token → gọi /auth/me để xác minh và lấy thông tin user.
 *   - login()/register() đều: lưu token → gọi /auth/me → set user.
 *   - logout(): xoá token + set user = null.
 *
 * Cách dùng trong component:
 *   const { user, login, logout, loading } = useAuth();
 */

const TOKEN_KEY = "auth_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true khi đang xác minh token lúc mở app

  // Khi component mount: nếu có token sẵn trong localStorage thì gọi /auth/me xác minh.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then((me) => setUser(me))
      .catch(() => localStorage.removeItem(TOKEN_KEY)) // token hỏng → xoá
      .finally(() => setLoading(false));
  }, []);

  // Hàm chung cho cả login và register: nhận token → lưu → load user
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
