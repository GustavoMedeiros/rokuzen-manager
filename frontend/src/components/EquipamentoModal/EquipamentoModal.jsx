import { useEffect, useState } from "react";
import styles from "./EquipamentoModal.module.css";

export default function EquipamentoModal({
  open,
  mode = "create", // "create" | "edit"
  initialData = null,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    ativo: true,
    observacoes: "",
  });

const TIPOS_EQUIPAMENTO = [
  { value: "FLEX_1", label: "Flex 1" },
  { value: "FLEX_2", label: "Flex 2" },
  { value: "SUPERIOR_1", label: "Superior 1" },
  { value: "SUPERIOR_2", label: "Superior 2" },
  { value: "INFERIOR_1", label: "Inferior 1" },
  { value: "INFERIOR_2", label: "Inferior 2" },
  { value: "CADEIRA_RAPIDA_1", label: "Cadeira Rápida 1" },
  { value: "CADEIRA_RAPIDA_2", label: "Cadeira Rápida 2" },
  { value: "CADEIRA_RAPIDA_3", label: "Cadeira Rápida 3" },
  { value: "CADEIRA_RAPIDA_4", label: "Cadeira Rápida 4" },
  { value: "REFLEXOLOGIA_1", label: "Reflexologia 1" },
  { value: "REFLEXOLOGIA_2", label: "Reflexologia 2" },
];


  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open) return;

    setErro("");
    setLoading(false);

    setForm({
      nome: initialData?.nome ?? "",
      tipo: initialData?.tipo ?? "",
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
    if (!form.tipo.trim()) return setErro("Tipo é obrigatório.");

    setLoading(true);
    try {
    await onSubmit({
      nome: form.nome.trim(),
      tipo: form.tipo,
      ativo: Boolean(form.ativo),
      observacoes: form.observacoes?.trim() || null,
    });
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Não foi possível salvar o equipamento.";
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
              {mode === "edit" ? "Editar Equipamento" : "Novo Equipamento"}
            </h2>
            <p className={styles.subtitle}>
              {mode === "edit"
                ? "Atualize as informações do equipamento"
                : "Cadastre um novo equipamento no sistema"}
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
                placeholder="Nome do equipamento"
              />
            </div>

            <div className={styles.field}>
            <label>Tipo *</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="">Selecione...</option>
              {TIPOS_EQUIPAMENTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
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
                placeholder="Observações sobre o equipamento"
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
              {loading ? "Salvando..." : mode === "edit" ? "Salvar Alterações" : "Cadastrar Equipamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}