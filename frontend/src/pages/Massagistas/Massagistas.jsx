import { useEffect, useState } from "react";
import styles from "./Massagistas.module.css";

import MassagistaModal from "../../components/MassagistaModal/MassagistaModal";
import MassagistaDetalhesModal from "../../components/MassagistaDetalhesModal/MassagistaDetalhesModal";

import {
  listarMassagistas,
  criarMassagista,
  atualizarMassagista,
  deletarMassagista,
} from "../../services/massagistas";

import { useLocation, useNavigate } from "react-router-dom";

export default function Massagistas() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [page, setPage] = useState(0);
  const size = 10;

  // modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [selected, setSelected] = useState(null);

  // modal detalhes
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsSelected, setDetailsSelected] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  async function carregar() {
    setLoading(true);
    setErro("");

    try {
      // Ajuste os params conforme seu backend (alguns usam sortBy/direction; outros sort=campo,dir)
      const data = await listarMassagistas({ page, size, sort: "nome,asc" });
      setPageData(data);
    } catch (e) {
      setErro("Não foi possível carregar os massagistas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // abre modal de criação vindo do Dashboard
  useEffect(() => {
    if (location.state?.openMassagistaModal) {
      abrirCriar();
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirCriar() {
    setSelected(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function abrirEditar(massagista) {
    setSelected(massagista);
    setModalMode("edit");
    setModalOpen(true);
  }

  function abrirDetalhes(massagista) {
    setDetailsSelected(massagista);
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
    const ok = window.confirm("Tem certeza que deseja excluir este massagista?");
    if (!ok) return;

    try {
      await deletarMassagista(id);
      await carregar();
    } catch {
      alert("Não foi possível excluir o massagista.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Massagistas</h1>
          <p className={styles.subtitle}>Gerencie os massagistas cadastrados no sistema</p>
        </div>

        <button className={styles.primaryBtn} type="button" onClick={abrirCriar}>
          + Novo Massagista
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
                <th>Telefone</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {pageData?.content?.length ? (
                pageData.content.map((m) => (
                  <tr
                    key={m.id}
                    className={styles.rowClickable}
                    onClick={() => abrirDetalhes(m)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") abrirDetalhes(m);
                    }}
                  >
                    <td className={styles.name}>{m.nome}</td>
                    <td>{m.telefone || "-"}</td>
                    <td>
                      <span className={m.ativo ? styles.statusActive : styles.statusInactive}>
                        {m.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td className={styles.actions}>
                      <button
                        className={styles.dangerBtn}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id);
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
                    Nenhum massagista encontrado.
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

      {/* Modal detalhes */}
      <MassagistaDetalhesModal
        open={detailsOpen}
        data={detailsSelected}
        onClose={fecharDetalhes}
        onEdit={editarPeloDetalhe}
      />

      {/* Modal create/edit existente */}
      <MassagistaModal
        open={modalOpen}
        mode={modalMode}
        initialData={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (modalMode === "edit" && selected?.id) {
            await atualizarMassagista(selected.id, payload);
          } else {
            await criarMassagista(payload);
          }
          await carregar();
        }}
      />
    </div>
  );
}