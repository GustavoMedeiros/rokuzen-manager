import axios from "axios";
import { parseApiError } from "./httpError";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

function normalizeToken(raw) {
  if (!raw) return null;

  let t = String(raw).trim();
  if (t === "null" || t === "undefined") return null;

  // aceita JSON: {"token":"..."} ou string JSON "\"eyJ...\""
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith('"') && t.endsWith('"'))) {
    try {
      const parsed = JSON.parse(t);
      if (typeof parsed === "string") t = parsed;
      else if (parsed?.token) t = parsed.token;
      else if (parsed?.accessToken) t = parsed.accessToken;
    } catch {
      // ignora
    }
  }

  t = t.replace(/^"+|"+$/g, "");
  if (t.toLowerCase().startsWith("bearer ")) t = t.slice(7).trim();

  return t || null;
}

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const rawToken = localStorage.getItem("rokuzen_token");
  const token = normalizeToken(rawToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (api.defaults.headers.common.Authorization) {
    config.headers.Authorization = api.defaults.headers.common.Authorization;
  }

  config.headers.Accept = config.headers.Accept || "application/json";

  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch"].includes(method)) {
    config.headers["Content-Type"] = config.headers["Content-Type"] || "application/json";
  }

  return config;
});

// ✅ Normaliza qualquer erro HTTP num formato único
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url;
    const method = (err?.config?.method || "").toUpperCase();
    console.warn("[HTTP ERROR]", status, method, url, err?.response?.data);
    return Promise.reject(parseApiError(err));
  }
);

export default api;