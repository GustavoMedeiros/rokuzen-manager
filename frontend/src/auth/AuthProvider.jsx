import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

const TOKEN_KEY = "rokuzen_token";
const USER_KEY = "rokuzen_user";

function normalizeToken(raw) {
  if (!raw) return null;

  let t = String(raw).trim();
  t = t.replace(/^"+|"+$/g, "");
  t = t.replace(/^Bearer\s+/i, "").trim();

  return t || null;
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const storedToken = normalizeToken(localStorage.getItem(TOKEN_KEY));
    if (storedToken) localStorage.setItem(TOKEN_KEY, storedToken);

    setToken(storedToken);
    setIsAuthenticated(!!storedToken);

    try {
      const storedUser = localStorage.getItem(USER_KEY);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setUser(null);
    }

    setLoadingAuth(false);
  }, []);

  async function login(usuario, senha) {
    const response = await api.post("/auth/login", { usuario, senha });

    const receivedToken = response?.data?.token ?? response?.data;
    const normalized = normalizeToken(receivedToken);

    if (!normalized) {
      throw new Error("Token não retornado pelo backend.");
    }

    const userObj = { usuario };

    localStorage.setItem(TOKEN_KEY, normalized);
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));

    setToken(normalized);
    setUser(userObj);
    setIsAuthenticated(true);

    return normalized;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, loadingAuth, login, logout }),
    [token, user, isAuthenticated, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}