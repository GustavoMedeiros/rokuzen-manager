import api from "../api/axios";

export async function listarMassagistas(params) {
  const { data } = await api.get("/api/massagistas", { params });
  return data;
}

export async function criarMassagista(payload) {
  const { data } = await api.post("/api/massagistas", payload);
  return data;
}

export async function atualizarMassagista(id, payload) {
  const { data } = await api.put(`/api/massagistas/${id}`, payload);
  return data;
}

export async function deletarMassagista(id) {
  const { data } = await api.delete(`/api/massagistas/${id}`);
  return data;
}