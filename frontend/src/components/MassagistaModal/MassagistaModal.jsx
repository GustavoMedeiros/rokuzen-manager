import { useEffect, useState } from "react";
import styles from "./MassagistaModal.module.css";

export default function MassagistaModal({
  open,
  mode = "create", // "create" | "edit"
  initialData = null,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    ativo: true,
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open) return;

    setErro("");
    setLoading(false);

    setForm({
      nome: initialData?.nome ?? "",
      telefone: initialData?.telefone ?? "",
      email: initialData?.email ?? "",
      ativo: initialData?.ativo ?? true,
      observacoes: initialData?.observacoes ?? "",
    });
  }, [open, initialData]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) return setErro("Nome é obrigatório.");
    if (!form.telefone.trim()) return setErro("Telefone é obrigatório.");

    setLoading(true);
    try {
      await onSubmit({
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        email: form.email?.trim() || null,
        ativo: Boolean(form.ativo),
        observacoes: form.observacoes?.trim() || null,
      });
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Não foi possível salvar o massagista.";
      setErro(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {mode === "edit" ? "Editar Massagista" : "Novo Massagista"}
            </h2>
            <p className={styles.subtitle}>
              {mode === "edit"
                ? "Atualize as informações do massagista"
                : "Cadastre um novo massagista no sistema"}
            </p>
          </div>

          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Nome *</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Nome do massagista"
              />
            </div>

            <div className={styles.field}>
              <label>Telefone *</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={Boolean(form.ativo)}
                  onChange={handleChange}
                />
                <span>Ativo</span>
              </label>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Observações</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                placeholder="Observações sobre o massagista"
                rows={4}
              />
            </div>
          </div>

          {erro && <div className={styles.error}>{erro}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading ? "Salvando..." : mode === "edit" ? "Salvar Alterações" : "Cadastrar Massagista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}