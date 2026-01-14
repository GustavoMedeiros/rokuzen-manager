import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

const TOKEN_KEY = "rokuzen_token";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Restaura sessão no refresh
    const stored = localStorage.getItem(TOKEN_KEY);
    setToken(stored);
    setIsAuthenticated(!!stored);
    setLoadingAuth(false);
  }, []);

  async function login(usuario, senha) {
    // aqui chama seu backend
    const response = await api.post("/auth/login", { usuario, senha });

    const receivedToken = response?.data?.token;
    if (!receivedToken) {
      throw new Error("Token não retornado pelo backend.");
    }

    localStorage.setItem(TOKEN_KEY, receivedToken);
    setToken(receivedToken);
    setIsAuthenticated(true);

    return receivedToken;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setIsAuthenticated(false);
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      loadingAuth,
      login,
      logout,
    }),
    [token, isAuthenticated, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}