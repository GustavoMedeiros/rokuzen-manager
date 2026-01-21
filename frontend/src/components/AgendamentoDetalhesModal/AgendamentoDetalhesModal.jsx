import { useEffect } from "react";
import styles from "./AgendamentoDetalhesModal.module.css";

function fmtBRL(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTimeBR(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);

  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgendamentoDetalhesModal({ open, agendamento, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const ag = agendamento;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Detalhes do Agendamento</h2>
            <p className={styles.subtitle}>
              {formatDateTimeBR(ag?.inicio)} – {formatDateTimeBR(ag?.fim)}
            </p>
          </div>

          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.item}>
              <span className={styles.label}>Cliente</span>
              <span className={styles.value}>{ag?.clienteNome ?? "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Massagista</span>
              <span className={styles.value}>{ag?.massagistaNome ?? "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Tipo</span>
              <span className={styles.value}>{ag?.tipoMassagem ?? "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Duração</span>
              <span className={styles.value}>{ag?.duracaoMin ?? "-"} min</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Valor</span>
              <span className={styles.valueStrong}>{fmtBRL(ag?.valor)}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Recurso</span>
              <span className={styles.value}>{ag?.equipamentoNome ?? "-"}</span>
            </div>

            <div className={`${styles.item} ${styles.full}`}>
              <span className={styles.label}>Observações</span>
              <span className={styles.value}>
                {ag?.observacoes?.trim?.() ? ag.observacoes : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}