import api from "../api/axios";

/**
 * GET /api/dashboard
 */
export async function obterDashboard() {
  const { data } = await api.get("/api/dashboard");
  return data;
}