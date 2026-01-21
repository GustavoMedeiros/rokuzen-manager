import { useEffect, useState } from "react";
import styles from "./Clientes.module.css";

import ClienteModal from "../../components/ClienteModal/ClienteModal";
import ClienteDetalhesModal from "../../components/ClienteDetalhesModal/ClienteDetalhesModal";

import {
  listarClientes,
  criarCliente,
  atualizarCliente,
  deletarCliente,
} from "../../services/clientes";

import { useLocation, useNavigate } from "react-router-dom";

export default function Clientes() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [page, setPage] = useState(0);
  const size = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [selected, setSelected] = useState(null);

  // ✅ detalhes
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [selectedDetalhes, setSelectedDetalhes] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  async function carregar() {
    setLoading(true);
    setErro("");

    try {
      const data = await listarClientes({ page, size, sort: "nome,asc" });
      setPageData(data);
    } catch (e) {
      setErro("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (location.state?.openClienteModal) {
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

  function abrirEditar(cliente) {
    setSelected(cliente);
    setModalMode("edit");
    setModalOpen(true);
  }

  function abrirDetalhes(cliente) {
    setSelectedDetalhes(cliente);
    setDetalhesOpen(true);
  }

  async function handleDelete(id) {
    const ok = window.confirm("Tem certeza que deseja excluir este cliente?");
    if (!ok) return;

    try {
      await deletarCliente(id);
      await carregar();
    } catch {
      alert("Não foi possível excluir o cliente.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.subtitle}>Gerencie os clientes cadastrados no sistema</p>
        </div>

        <button className={styles.primaryBtn} type="button" onClick={abrirCriar}>
          + Novo Cliente
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
                <th>Email</th>
                <th>CPF</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {pageData?.content?.length ? (
                pageData.content.map((c) => (
                  <tr
                    key={c.id}
                    className={styles.rowClickable}
                    role="button"
                    tabIndex={0}
                    onClick={() => abrirDetalhes(c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") abrirDetalhes(c);
                    }}
                  >
                    <td className={styles.name}>{c.nome}</td>
                    <td>{c.telefone}</td>
                    <td>{c.email || "-"}</td>
                    <td>{c.cpf || "-"}</td>

                    <td className={styles.actions}>
                      <button
                        className={styles.dangerBtn}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c.id);
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
                    Nenhum cliente encontrado.
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

      {/* Modal de detalhes */}
      <ClienteDetalhesModal
        open={detalhesOpen}
        cliente={selectedDetalhes}
        onClose={() => setDetalhesOpen(false)}
        onEdit={(cli) => {
          setDetalhesOpen(false);
          abrirEditar(cli);
        }}
      />

      {/* Modal de criar/editar */}
      <ClienteModal
        open={modalOpen}
        mode={modalMode}
        initialData={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (modalMode === "edit" && selected?.id) {
            await atualizarCliente(selected.id, payload);
          } else {
            await criarCliente(payload);
          }
          await carregar();
        }}
      />
    </div>
  );
}