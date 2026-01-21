import styles from "./EquipamentoDetalhesModal.module.css";

export default function EquipamentoDetalhesModal({ open, data, onClose, onEdit }) {
  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Detalhes do Equipamento</h2>
            <p className={styles.subtitle}>Visualize as informações do cadastro</p>
          </div>

          <button
            type="button"
            className={styles.closeIcon}
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.item}>
              <span className={styles.label}>Nome</span>
              <span className={styles.valueStrong}>{data?.nome ?? "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Tipo</span>
              <span className={styles.value}>{data?.tipo ?? "-"}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.label}>Status</span>
              <span className={styles.value}>{data?.ativo ? "Ativo" : "Inativo"}</span>
            </div>
          </div>

          <div className={styles.obsBox}>
            <span className={styles.label}>Observações</span>
            <p className={styles.obsText}>
              {data?.observacoes ?? data?.obs ?? "-"}
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Fechar
          </button>

          <button type="button" className={styles.primaryBtn} onClick={onEdit}>
            Editar
          </button>
        </div>
      </div>
    </>
  );
}