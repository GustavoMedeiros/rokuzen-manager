import { useEffect } from "react";
import styles from "./ClienteDetalhesModal.module.css";

export default function ClienteDetalhesModal({ open, cliente, onClose, onEdit }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const c = cliente;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Detalhes do Cliente</h2>
            <p className={styles.subtitle}>Visualize as informações do cadastro</p>
          </div>

          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.item}>
              <span className={styles.label}>Nome</span>
              <span className={styles.valueStrong}>{c?.nome ?? "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Telefone</span>
              <span className={styles.value}>{c?.telefone ?? "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{c?.email || "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>CPF</span>
              <span className={styles.value}>{c?.cpf || "-"}</span>
            </div>

            {c?.observacoes && (
            <div className={styles.obsBox}>
            <span className={styles.label}>Observações</span>
            <p className={styles.obsText}>{c.observacoes}</p>
            </div>
        )}
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Fechar
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => onEdit?.(c)}
            disabled={!c?.id}
          >
            Editar
          </button>
        </div>
      </div>
    </>
  );
}