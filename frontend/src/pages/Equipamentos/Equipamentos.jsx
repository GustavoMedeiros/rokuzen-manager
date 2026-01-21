import { useEffect, useState } from "react";
import styles from "./Equipamentos.module.css";

import EquipamentoModal from "../../components/EquipamentoModal/EquipamentoModal";
import EquipamentoDetalhesModal from "../../components/EquipamentoDetalhesModal/EquipamentoDetalhesModal";

import {
  listarEquipamentos,
  criarEquipamento,
  atualizarEquipamento,
  deletarEquipamento,
} from "../../services/equipamentos";

export default function Equipamentos() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [page, setPage] = useState(0);
  const size = 10;

  // modal create/edit (já existe)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [selected, setSelected] = useState(null);

  // modal detalhes (novo)
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsSelected, setDetailsSelected] = useState(null);

  async function carregar() {
    setLoading(true);
    setErro("");

    try {
      const data = await listarEquipamentos({
        page,
        size,
        sortBy: "nome",
        direction: "ASC",
      });
      setPageData(data);
    } catch (e) {
      setErro("Não foi possível carregar os equipamentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function abrirCriar() {
    setSelected(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function abrirEditar(item) {
    setSelected(item);
    setModalMode("edit");
    setModalOpen(true);
  }

  function abrirDetalhes(item) {
    setDetailsSelected(item);
    setDetailsOpen(true);
  }

  function fecharDetalhes() {
    setDetailsOpen(false);
    setDetailsSelected(null);
  }

  function editarPeloDetalhe() {
    if (!detailsSelected) return;
    fecharDetalhes();
    abrirEditar(detailsSelected);
  }

  async function handleDelete(id) {
    const ok = window.confirm("Tem certeza que deseja excluir este equipamento?");
    if (!ok) return;

    try {
      await deletarEquipamento(id);
      await carregar();
    } catch {
      alert("Não foi possível excluir o equipamento.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Equipamentos</h1>
          <p className={styles.subtitle}>Gerencie os equipamentos cadastrados no sistema</p>
        </div>

        <button className={styles.primaryBtn} type="button" onClick={abrirCriar}>
          + Novo Equipamento
        </button>
      </div>

      {loading && <div className={styles.state}>Carregando...</div>}
      {erro && <div className={styles.error}>{erro}</div>}

      {!loading && !erro && (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Ativo</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {pageData?.content?.length ? (
                pageData.content.map((e) => (
                  <tr
                    key={e.id}
                    className={styles.rowClickable}
                    onClick={() => abrirDetalhes(e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") abrirDetalhes(e);
                    }}
                  >
                    <td className={styles.name}>{e.nome}</td>
                    <td>{e.tipo}</td>
                    <td>
                      <span className={e.ativo ? styles.badgeOn : styles.badgeOff}>
                        {e.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td className={styles.actions}>
                      {/* Removido o Editar da lista (fica só no modal) */}
                      <button
                        className={styles.dangerBtn}
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleDelete(e.id);
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    Nenhum equipamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </button>

            <span className={styles.pageInfo}>
              Página <strong>{(pageData?.number ?? 0) + 1}</strong> de{" "}
              <strong>{pageData?.totalPages ?? 1}</strong>
            </span>

            <button
              type="button"
              className={styles.pageBtn}
              disabled={pageData?.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal detalhes (novo) */}
      <EquipamentoDetalhesModal
        open={detailsOpen}
        data={detailsSelected}
        onClose={fecharDetalhes}
        onEdit={editarPeloDetalhe}
      />

      {/* Modal create/edit existente */}
      <EquipamentoModal
        open={modalOpen}
        mode={modalMode}
        initialData={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (modalMode === "edit" && selected?.id) {
            await atualizarEquipamento(selected.id, payload);
          } else {
            await criarEquipamento(payload);
          }
          await carregar();
        }}
      />
    </div>
  );
}