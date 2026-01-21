import api from "../api/axios";

export async function listarEquipamentos(params) {
  const res = await api.get("/api/equipamentos", { params });
  return res.data;
}

export async function criarEquipamento(data) {
  const res = await api.post("/api/equipamentos", data);
  return res.data;
}

export async function atualizarEquipamento(id, data) {
  const res = await api.put(`/api/equipamentos/${id}`, data);
  return res.data;
}

export async function deletarEquipamento(id) {
  const res = await api.delete(`/api/equipamentos/${id}`);
  return res.data;
}