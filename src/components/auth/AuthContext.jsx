/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const LS_USERS = "bk_users";
const LS_CURRENT = "bk_current_user";

/** @typedef {{ id: string, name: string, email: string }} AuthUser */
/** @typedef {{ id: string, name: string, email: string, password: string, createdAt: string }} StoredUser */
/** @typedef {{
 *  user: AuthUser | null,
 *  register: (p: { name?: string, email: string, password: string }) => ({ ok: boolean, message?: string, user?: AuthUser }),
 *  login: (p: { email: string, password: string }) => ({ ok: boolean, message?: string, user?: AuthUser }),
 *  logout: () => void
 * }} AuthApi */

/**
 * @template T
 * @param {string|null} str
 * @param {T} fallback
 * @returns {T}
 */
function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

const AuthContext = createContext(/** @type {AuthApi|null} */ (null));

export function AuthProvider({ children }) {
  // ✅ load user ngay trong initializer (không dùng useEffect)
  const [user, setUser] = useState(() =>
    safeJsonParse(localStorage.getItem(LS_CURRENT), /** @type {AuthUser|null} */ (null))
  );

  const api = useMemo(() => {
    /** @returns {StoredUser[]} */
    function getUsers() {
      return safeJsonParse(localStorage.getItem(LS_USERS), /** @type {StoredUser[]} */ ([]));
    }

    /** @param {StoredUser[]} users */
    function saveUsers(users) {
      localStorage.setItem(LS_USERS, JSON.stringify(users));
    }

    /** @param {{name?:string, email:string, password:string}} p */
    function register({ name, email, password }) {
      const users = getUsers();
      const normalizedEmail = String(email).trim().toLowerCase();

      if (!normalizedEmail || !password) {
        return { ok: false, message: "Vui lòng nhập email và mật khẩu." };
      }

      const exists = users.some((u) => u.email === normalizedEmail);
      if (exists) {
        return { ok: false, message: "Email đã tồn tại. Vui lòng dùng email khác." };
      }

      /** @type {StoredUser} */
      const newUser = {
        id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
        name: String(name || "").trim() || "User",
        email: normalizedEmail,
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);

      /** @type {AuthUser} */
      const current = { id: newUser.id, name: newUser.name, email: newUser.email };
      localStorage.setItem(LS_CURRENT, JSON.stringify(current));
      setUser(current);

      return { ok: true, user: current };
    }

    /** @param {{email:string, password:string}} p */
    function login({ email, password }) {
      const users = getUsers();
      const normalizedEmail = String(email).trim().toLowerCase();

      const found = users.find((u) => u.email === normalizedEmail && u.password === password);
      if (!found) return { ok: false, message: "Sai email hoặc mật khẩu." };

      /** @type {AuthUser} */
      const current = { id: found.id, name: found.name, email: found.email };
      localStorage.setItem(LS_CURRENT, JSON.stringify(current));
      setUser(current);

      return { ok: true, user: current };
    }

    function logout() {
      localStorage.removeItem(LS_CURRENT);
      setUser(null);
    }

    return { user, register, login, logout };
  }, [user]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
