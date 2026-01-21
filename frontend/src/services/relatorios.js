import api from "../api/axios";

/**
 * GET /api/relatorios?inicioDe=YYYY-MM-DD&inicioAte=YYYY-MM-DD
 * Backend recebe LocalDate, então envie apenas a data.
 */
export async function gerarRelatorios({ inicioDe, inicioAte }) {
  const { data } = await api.get("/api/relatorios", {
    params: { inicioDe, inicioAte },
  });
  return data;
}