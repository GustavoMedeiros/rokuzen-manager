import api from "../api/axios";

/**
 * GET /api/clientes?page=0&size=10&sort=nome,asc
 * Retorna Page<Cliente>
 */
export async function listarClientes({ page = 0, size = 10, sort = "nome,asc" } = {}) {
  const response = await api.get("/api/clientes", {
    params: { page, size, sort },
  });
  return response.data;
}

export async function buscarClientePorId(id) {
  const response = await api.get(`/api/clientes/${id}`);
  return response.data;
}

export async function criarCliente(payload) {
  const response = await api.post("/api/clientes", payload);
  return response.data;
}

export async function atualizarCliente(id, payload) {
  const response = await api.put(`/api/clientes/${id}`, payload);
  return response.data;
}

export async function deletarCliente(id) {
  await api.delete(`/api/clientes/${id}`);
}