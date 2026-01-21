import { useMemo, useState } from "react";
import styles from "./Relatorios.module.css";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { gerarRelatorios } from "../../services/relatorios";

const COLORS = ["#485a49", "#d8cbb7", "#80907b", "#b9aa93", "#3f4f40"];

function fmtBRL(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

function isoDateToBR(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${d}/${m}/${y}`;
}

function TooltipBRL({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 18px 36px rgba(0,0,0,0.08)",
        fontFamily: "Poppins",
        fontSize: 13,
        color: "#333",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{isoDateToBR(label)}</div>
      <div>{fmtBRL(v)}</div>
    </div>
  );
}

function TooltipCount({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 18px 36px rgba(0,0,0,0.08)",
        fontFamily: "Poppins",
        fontSize: 13,
        color: "#333",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>{fmtNumber(v)} agendamentos</div>
    </div>
  );
}

export default function Relatorios() {
  // input type="date" -> YYYY-MM-DD
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [data, setData] = useState(null);

  const indicadores = data?.indicadores ?? null;

  const ocupacao = useMemo(() => {
    const arr = data?.ocupacaoPorEquipamento ?? [];
    return [...arr].sort((a, b) => (b.totalAgendamentos ?? 0) - (a.totalAgendamentos ?? 0));
  }, [data]);

  const pieData = useMemo(() => {
    return ocupacao.map((o) => ({
      name: o.equipamentoNome,
      value: Number(o.totalAgendamentos ?? 0),
      id: o.equipamentoId,
    }));
  }, [ocupacao]);

  const faturamentoDiario = useMemo(() => {
    const arr = data?.faturamentoDiario ?? [];
    return [...arr]
      .map((f) => ({
        data: String(f.data), // LocalDate -> "YYYY-MM-DD"
        valor: Number(f.valor ?? 0),
      }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [data]);

  async function handleGerar() {
    setErro("");

    if (!inicio) return setErro("Selecione a data início.");
    if (!fim) return setErro("Selecione a data fim.");
    if (fim < inicio) return setErro("Data fim não pode ser menor que data início.");

    setLoading(true);
    try {
      // ✅ IMPORTANTE: enviar LocalDate (YYYY-MM-DD)
      const res = await gerarRelatorios({ inicioDe: inicio, inicioAte: fim });
      setData(res);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Não foi possível gerar os relatórios.";
      setErro(String(msg));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Relatórios</h1>
          <p className={styles.subtitle}>Análise de ocupação e faturamento</p>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.card}>
        <div className={styles.filtersRow}>
          <div className={styles.field}>
            <label>Data Início</label>
            <div className={styles.inputWithIcon}>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Data Fim</label>
            <div className={styles.inputWithIcon}>
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>

          <button
            type="button"
            className={styles.primaryBtnWide}
            onClick={handleGerar}
            disabled={loading}
          >
            {loading ? "Gerando..." : "Gerar Relatórios"}
          </button>
        </div>

        {erro && <div className={styles.error}>{erro}</div>}
      </div>

      {/* Indicadores + gráficos */}
      {data && (
        <>
          <div className={styles.kpis}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Faturamento Total</span>
              <div className={styles.kpiValue}>{fmtBRL(indicadores?.faturamentoTotal)}</div>
            </div>

            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Total de Atendimentos</span>
              <div className={styles.kpiValue}>{fmtNumber(indicadores?.totalAtendimentos)}</div>
            </div>

            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Ticket Médio</span>
              <div className={styles.kpiValue}>{fmtBRL(indicadores?.ticketMedio)}</div>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            {/* Ocupação */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Ocupação por Cadeira</h2>

              <div className={styles.pieArea}>
                <div className={styles.pieCanvas}>
                  {pieData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius="78%"
                          paddingAngle={1}
                          stroke="rgba(255,255,255,0.95)"
                          strokeWidth={2}
                        >
                          {pieData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<TooltipCount />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.empty}>Sem dados de ocupação no período.</div>
                  )}
                </div>
              </div>

              <div className={styles.legend}>
                {ocupacao.length ? (
                  ocupacao.map((o, idx) => (
                    <div key={o.equipamentoId} className={styles.legendRow}>
                      <div className={styles.legendLeft}>
                        <span
                          className={styles.dot}
                          style={{ background: COLORS[idx % COLORS.length] }}
                        />
                        <span className={styles.legendName}>{o.equipamentoNome}</span>
                      </div>

                      <span className={styles.legendRight}>
                        {o.totalAgendamentos} agendamentos
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>Sem dados no período.</div>
                )}
              </div>
            </div>

            {/* Faturamento Diário */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Faturamento Diário</h2>

              <div className={styles.barCanvas}>
                {faturamentoDiario.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={faturamentoDiario}
                      margin={{ top: 8, right: 10, left: 0, bottom: 12 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="data"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => isoDateToBR(v)}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<TooltipBRL />} />
                      <Bar dataKey="valor" fill="#485a49" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.empty}>Sem faturamento no período.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}