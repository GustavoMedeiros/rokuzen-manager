import api from "../api/axios";

export async function listarAgendamentos(params) {
  const { data } = await api.get("/api/agendamentos", { params });
  return data; // Page<AgendamentoResponse>
}

export async function criarAgendamento(payload) {
  const { data } = await api.post("/api/agendamentos", payload);
  return data; // AgendamentoResponse
}

export async function atualizarAgendamento(id, payload) {
  const { data } = await api.put(`/api/agendamentos/${id}`, payload);
  return data;
}

export async function deletarAgendamento(id) {
  await api.delete(`/api/agendamentos/${id}`);
}