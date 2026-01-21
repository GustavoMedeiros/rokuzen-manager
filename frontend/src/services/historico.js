import api from "../api/axios";

export async function buscarHistoricoPorCliente(params) {
  // params: { clienteId, page, size, sortBy, direction }
  const { data } = await api.get("/api/historico", { params });
  return data; // HistoricoResponse
}