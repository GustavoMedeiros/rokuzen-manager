// src/api/httpError.js
export function parseApiError(err) {
  const status = err?.response?.status ?? null;
  const data = err?.response?.data;

  // Quando o servidor não responde (CORS, offline, timeout, etc.)
  if (!err?.response) {
    return {
      status: null,
      title: "Falha de conexão",
      message: "Não foi possível se conectar ao servidor. Verifique se o backend está rodando.",
      fieldErrors: {},
      raw: err,
    };
  }

  // Normaliza message
  const message =
    (typeof data === "string" ? data : null) ||
    data?.message ||
    data?.error ||
    err?.message ||
    "Ocorreu um erro.";

  // Erros de validação (Spring costuma mandar padrões diferentes)
  // 1) { errors: { campo: "msg" } } (caso você implemente assim)
  if (status === 400) {
    const fieldErrors = {};

    // Padrão comum: { errors: [{ field, defaultMessage }] }
    if (Array.isArray(data?.errors)) {
      for (const e of data.errors) {
        if (e?.field) fieldErrors[e.field] = e.defaultMessage || "Inválido";
      }
    }

    // Padrão comum: { fieldErrors: { campo: "msg" } }
    if (data?.fieldErrors && typeof data.fieldErrors === "object") {
      Object.assign(fieldErrors, data.fieldErrors);
    }

    // Padrão do MethodArgumentNotValidException se você não customizou:
    // às vezes vem só "Validation failed for argument..."
    return {
      status,
      title: "Dados inválidos",
      message: Object.keys(fieldErrors).length
        ? "Revise os campos destacados."
        : message,
      fieldErrors,
      raw: data,
    };
  }

  if (status === 401) {
    return {
      status,
      title: "Sessão expirada",
      message: "Sua sessão expirou ou o token é inválido. Faça login novamente.",
      fieldErrors: {},
      raw: data,
    };
  }

  if (status === 403) {
    return {
      status,
      title: "Acesso negado",
      message: "Você não tem permissão para realizar esta ação.",
      fieldErrors: {},
      raw: data,
    };
  }

  if (status === 409) {
    return {
      status,
      title: "Conflito de agenda",
      message: message || "Já existe um agendamento conflitante para esse horário.",
      fieldErrors: {},
      raw: data,
    };
  }

  if (status >= 500) {
    return {
      status,
      title: "Erro no servidor",
      message: "Ocorreu um erro interno no servidor. Tente novamente em instantes.",
      fieldErrors: {},
      raw: data,
    };
  }

  return {
    status,
    title: "Erro",
    message,
    fieldErrors: {},
    raw: data,
  };
}