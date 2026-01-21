import { useEffect, useMemo, useState } from "react";
import styles from "./AgendamentoModal.module.css";

function toId(v) {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function AgendamentoModal({
  open,
  onClose,
  onSubmit,
  clientes = [],
  massagistas = [],
  equipamentos = [],
  tiposMassagem = [],
  horarios = [],
}) {
  const [form, setForm] = useState({
    clienteId: "",
    massagistaId: "",
    equipamentoId: "",
    tipoMassagem: "",
    horario: "",
    valor: "",
    duracaoMin: "",
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);

  // erro normalizado
  const [apiError, setApiError] = useState(null); // {status,title,message,fieldErrors}

  const tipoSelecionado = useMemo(() => {
    return tiposMassagem.find((t) => t.value === form.tipoMassagem) || null;
  }, [form.tipoMassagem, tiposMassagem]);

  useEffect(() => {
    if (!open) return;

    setApiError(null);
    setLoading(false);
    setForm({
      clienteId: "",
      massagistaId: "",
      equipamentoId: "",
      tipoMassagem: "",
      horario: "",
      valor: "",
      duracaoMin: "",
      observacoes: "",
    });
  }, [open]);

  useEffect(() => {
    if (!tipoSelecionado) return;
    setForm((prev) => ({
      ...prev,
      valor: String(tipoSelecionado.valor ?? ""),
      duracaoMin: String(tipoSelecionado.duracaoMin ?? ""),
    }));
  }, [tipoSelecionado]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const clienteId = toId(form.clienteId);
    const massagistaId = toId(form.massagistaId);
    const equipamentoId = toId(form.equipamentoId);

    // validações locais (rápidas)
    if (!clienteId) return setApiError({ title: "Dados inválidos", message: "Cliente é obrigatório.", fieldErrors: {} });
    if (!massagistaId) return setApiError({ title: "Dados inválidos", message: "Massagista é obrigatório.", fieldErrors: {} });
    if (!equipamentoId) return setApiError({ title: "Dados inválidos", message: "Recurso (equipamento) é obrigatório.", fieldErrors: {} });
    if (!form.tipoMassagem) return setApiError({ title: "Dados inválidos", message: "Tipo de massagem é obrigatório.", fieldErrors: {} });
    if (!form.horario) return setApiError({ title: "Dados inválidos", message: "Horário é obrigatório.", fieldErrors: {} });

    setLoading(true);

    try {
      const cliente = clientes.find((c) => Number(c.id) === clienteId);
      const massagista = massagistas.find((m) => Number(m.id) === massagistaId);
      const equipamento = equipamentos.find((r) => Number(r.id) === equipamentoId);
      const tipo = tiposMassagem.find((t) => t.value === form.tipoMassagem);

      const duracaoMinNum = Number(form.duracaoMin || tipo?.duracaoMin || 0);
      const valorNum = Number(form.valor || tipo?.valor || 0);

      await onSubmit({
        clienteId,
        clienteNome: cliente?.nome ?? "-",
        massagistaId,
        massagistaNome: massagista?.nome ?? "-",
        equipamentoId,
        equipamentoNome: equipamento?.nome ?? "-",
        tipoMassagem: form.tipoMassagem,
        tipoMassagemLabel: tipo?.label ?? form.tipoMassagem,
        horario: form.horario,
        duracaoMin: Number.isFinite(duracaoMinNum) ? duracaoMinNum : 0,
        valor: Number.isFinite(valorNum) ? valorNum : 0,
        observacoes: form.observacoes?.trim() || null,
      });
    } catch (err) {
      // agora err já é normalizado pelo axios interceptor
      setApiError(err);
    } finally {
      setLoading(false);
    }
  }

  const fieldErrors = apiError?.fieldErrors || {};
  const fieldErrorList = Object.entries(fieldErrors);

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Novo Agendamento</h2>
            <p className={styles.subtitle}>Crie um agendamento na grade</p>
          </div>

          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.full}`}>
              <label>Cliente *</label>
              <select name="clienteId" value={form.clienteId} onChange={handleChange}>
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Massagista *</label>
              <select name="massagistaId" value={form.massagistaId} onChange={handleChange}>
                <option value="">Selecione o massagista</option>
                {massagistas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Cadeira (equipamento) *</label>
              <select name="equipamentoId" value={form.equipamentoId} onChange={handleChange}>
                <option value="">Selecione a cadeira</option>
                {equipamentos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Tipo de Massagem *</label>
              <select name="tipoMassagem" value={form.tipoMassagem} onChange={handleChange}>
                <option value="">Selecione o tipo</option>
                {tiposMassagem.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Horário *</label>
              <select name="horario" value={form.horario} onChange={handleChange}>
                <option value="">Selecione o horário</option>
                {horarios.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Duração (min)</label>
              <input
                type="number"
                min="0"
                step="1"
                name="duracaoMin"
                value={form.duracaoMin}
                onChange={handleChange}
                placeholder="Ex: 60"
              />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Valor (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="valor"
                value={form.valor}
                onChange={handleChange}
                placeholder="Ex: 120.00"
              />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Observações</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                placeholder="Observações do agendamento (opcional)"
                rows={4}
              />
            </div>
          </div>

          {apiError && (
            <div className={styles.error}>
              <strong>{apiError.title || "Erro"}</strong>
              <div>{apiError.message || "Ocorreu um erro."}</div>

              {fieldErrorList.length > 0 && (
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {fieldErrorList.map(([field, msg]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {String(msg)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>

            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}