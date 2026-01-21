import { useEffect, useMemo, useState } from "react";
import styles from "./Historico.module.css";

import { listarClientes } from "../../services/clientes";
import { buscarHistoricoPorCliente } from "../../services/historico";

function formatMoneyBR(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(iso) {
  if (!iso) return "-";
  const [date] = String(iso).split("T");
  const [yyyy, mm, dd] = date.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(iso) {
  if (!iso) return "-";
  return String(iso).slice(11, 16);
}

function mapTipoMassagem(tipo) {
  if (!tipo) return "-";
  const map = {
    MACA: "Maca",
    RAPIDA: "Rápida",
    REFLEXOLOGIA: "Reflexologia",
    FLEX: "Flex",
  };
  return map[String(tipo)] ?? String(tipo);
}

export default function Historico() {
  const [clientes, setClientes] = useState([]);

  const [clienteId, setClienteId] = useState("");

  const [loadingBase, setLoadingBase] = useState(true);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [kpis, setKpis] = useState({
    totalAtendimentos: 0,
    valorTotalGasto: 0,
    ticketMedio: 0,
  });

  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0);
  const size = 10;

  const selectedClienteNome = useMemo(() => {
    const c = clientes.find((x) => String(x.id) === String(clienteId));
    return c?.nome ?? "";
  }, [clientes, clienteId]);

  async function carregarClientes() {
    setLoadingBase(true);
    setErro("");

    try {
      const cliPage = await listarClientes({ page: 0, size: 999, sort: "nome,asc" });
      const list = cliPage?.content ?? [];
      setClientes(list);

      if (list.length > 0) {
        setClienteId(String(list[0].id));
      } else {
        setClienteId("");
      }
    } catch (e) {
      setErro("Não foi possível carregar os clientes.");
      setClientes([]);
      setClienteId("");
    } finally {
      setLoadingBase(false);
    }
  }

  async function carregarHistorico() {
    if (!clienteId) {
      setPageData({ content: [], number: 0, totalPages: 1, last: true });
      setKpis({ totalAtendimentos: 0, valorTotalGasto: 0, ticketMedio: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const data = await buscarHistoricoPorCliente({
        clienteId: Number(clienteId),
        page,
        size,
        sortBy: "inicio",
        direction: "DESC",
      });

      setKpis({
        totalAtendimentos: data?.totalAtendimentos ?? 0,
        valorTotalGasto: data?.valorTotalGasto ?? 0,
        ticketMedio: data?.ticketMedio ?? 0,
      });

      setPageData(data?.atendimentos ?? { content: [], number: 0, totalPages: 1, last: true });
    } catch (e) {
      setErro("Não foi possível carregar o histórico.");
      setKpis({ totalAtendimentos: 0, valorTotalGasto: 0, ticketMedio: 0 });
      setPageData({ content: [], number: 0, totalPages: 1, last: true });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // quando muda cliente, volta pra página 0
    setPage(0);
  }, [clienteId]);

  useEffect(() => {
    // carrega histórico quando clienteId OU page mudam
    carregarHistorico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId, page]);

  function handleClienteChange(e) {
    setClienteId(e.target.value);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Histórico de Atendimentos</h1>
          <p className={styles.subtitle}>Consulte o histórico de atendimentos por cliente</p>
        </div>
      </div>

      {loadingBase && <div className={styles.state}>Carregando...</div>}
      {erro && <div className={styles.error}>{erro}</div>}

      {!loadingBase && !erro && (
        <>
          {/* Card de filtro */}
          <div className={styles.card}>
            <div className={styles.filterBlock}>
              <label className={styles.filterLabel}>Selecione o Cliente</label>
              <select
                className={styles.select}
                value={clienteId}
                onChange={handleClienteChange}
                disabled={loadingBase || clientes.length === 0}
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>

              {selectedClienteNome && (
                <div className={styles.filterHint}>
                  Visualizando histórico de: <strong>{selectedClienteNome}</strong>
                </div>
              )}
            </div>
          </div>

          {/* KPIs */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Total de Atendimentos</div>
              <div className={styles.kpiValue}>{loading ? "—" : kpis.totalAtendimentos}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Total Gasto</div>
              <div className={styles.kpiValue}>{loading ? "—" : formatMoneyBR(kpis.valorTotalGasto)}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Ticket Médio</div>
              <div className={styles.kpiValue}>{loading ? "—" : formatMoneyBR(kpis.ticketMedio)}</div>
            </div>
          </div>

          {/* Tabela */}
          <div className={styles.card}>
            <div className={styles.tableHeader}>
              <div className={styles.tableTitle}>Atendimentos</div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Tipo de Massagem</th>
                  <th>Massagista</th>
                  <th>Cadeira</th>
                  <th>Duração</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className={styles.empty}>
                      Carregando...
                    </td>
                  </tr>
                ) : pageData?.content?.length ? (
                  pageData.content.map((a) => (
                    <tr key={a.id}>
                      <td className={styles.name}>{formatDateBR(a.inicio)}</td>
                      <td>{formatTime(a.inicio)}</td>
                      <td>{mapTipoMassagem(a.tipoMassagem)}</td>
                      <td>{a.massagistaNome ?? "-"}</td>
                      <td>{a.equipamentoNome ?? "-"}</td>
                      <td>{a.duracaoMin ? `${a.duracaoMin} min` : "-"}</td>
                      <td>{formatMoneyBR(a.valor)}</td>
                      <td>
                        <span className={styles.badge}>{a.status ?? "Agendado"}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.empty}>
                      Nenhum atendimento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginação (mesmo estilo Clientes) */}
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page === 0 || loading}
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
                disabled={!!pageData?.last || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}