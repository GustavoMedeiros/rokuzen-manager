import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

import { obterDashboard } from "../../services/dashboard";

import calendarIcon from "../../assets/icons/calendar.svg";
import userIcon from "../../assets/icons/user.svg";
import massageIcon from "../../assets/icons/massage.svg";
import moneyIcon from "../../assets/icons/money.svg";

function fmtBRL(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function KpiIcon({ name }) {
  switch (name) {
    case "calendar":
      return <img src={calendarIcon} alt="" className={styles.kpiIcon} />;
    case "users":
      return <img src={userIcon} alt="" className={styles.kpiIcon} />;
    case "massage":
      return <img src={massageIcon} alt="" className={styles.kpiIcon} />;
    case "money":
      return <img src={moneyIcon} alt="" className={styles.kpiIcon} />;
    default:
      return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");

    try {
      const res = await obterDashboard();
      setData(res);
    } catch {
      setErro("Não foi possível carregar o dashboard.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const equipamentos = useMemo(() => {
    const arr = data?.equipamentosDisponiveis ?? [];
    return [...arr].sort((a, b) => (b.quantidade ?? 0) - (a.quantidade ?? 0));
  }, [data]);

  function abrirAgendamentosComModal() {
    navigate("/agendamentos", { state: { openAgendamentoModal: true } });
  }

  function abrirClientesComModal() {
    navigate("/clientes", { state: { openClienteModal: true } });
  }

  function abrirRelatorios() {
    navigate("/relatorios");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Visão geral do sistema</p>
        </div>
      </div>

      {loading && <div className={styles.state}>Carregando...</div>}
      {erro && <div className={styles.error}>{erro}</div>}

      {!loading && !erro && (
        <>
          <div className={styles.kpis}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Agendamentos Hoje</span>
                <div className={styles.kpiIconWrapper}>
                  <KpiIcon name="calendar" />
                </div>
              </div>
              <div className={styles.kpiValue}>{data?.agendamentosHoje ?? 0}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Total de Clientes</span>
                <div className={styles.kpiIconWrapper}>
                  <KpiIcon name="users" />
                </div>
              </div>
              <div className={styles.kpiValue}>{data?.totalClientes ?? 0}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Massagistas Ativos</span>
                <div className={styles.kpiIconWrapper}>
                  <KpiIcon name="massage" />
                </div>
              </div>
              <div className={styles.kpiValue}>{data?.massagistasAtivos ?? 0}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Faturamento do Mês</span>
                <div className={styles.kpiIconWrapper}>
                  <KpiIcon name="money" />
                </div>
              </div>
              <div className={styles.kpiValue}>{fmtBRL(data?.faturamentoMes)}</div>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.bigCard}>
              <h2 className={styles.cardTitle}>Cadeiras Disponíveis</h2>

              <div className={styles.list}>
                {equipamentos.length ? (
                  equipamentos.map((e, idx) => (
                    <div key={`${e.grupo}-${idx}`} className={styles.resourceRow}>
                      <span className={styles.resourceName}>{e.grupo}</span>
                      <span className={styles.resourceQty}>{e.quantidade}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>Nenhum recurso encontrado.</div>
                )}
              </div>
            </div>

            <div className={styles.bigCard}>
              <h2 className={styles.cardTitle}>Ações Rápidas</h2>

              <div className={styles.quickActions}>
                <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={abrirAgendamentosComModal}
                >
                  Novo Agendamento
                </button>

                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={abrirClientesComModal}
                >
                  Cadastrar Cliente
                </button>

                <button
                  type="button"
                  className={styles.tertiaryAction}
                  onClick={abrirRelatorios}
                >
                  Ver Relatórios
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}