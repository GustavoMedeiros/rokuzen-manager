import { useEffect, useMemo, useState } from "react";
import styles from "./Agendamentos.module.css";

import AgendamentoModal from "../../components/AgendamentoModal/AgendamentoModal";
import AgendamentoDetalhesModal from "../../components/AgendamentoDetalhesModal/AgendamentoDetalhesModal";

import { listarClientes } from "../../services/clientes";
import { listarMassagistas } from "../../services/massagistas";
import { listarEquipamentos } from "../../services/equipamentos";
import {
  listarAgendamentos,
  criarAgendamento,
  deletarAgendamento,
} from "../../services/agendamento";

import useAuth from "../../auth/useAuth";

import { useLocation, useNavigate } from "react-router-dom";

const TIPOS_MASSAGEM = [
  { value: "MACA", label: "Maca", duracaoMin: 60, valor: 120.0 },
  { value: "RAPIDA", label: "Rápida", duracaoMin: 30, valor: 70.0 },
  { value: "REFLEXOLOGIA", label: "Reflexologia", duracaoMin: 45, valor: 95.0 },
  { value: "FLEX", label: "Flex", duracaoMin: 60, valor: 140.0 },
];

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getSlots(start = "08:00", end = "18:00", stepMin = 15) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  const out = [];
  for (let t = startMin; t <= endMin; t += stepMin) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
  }
  return out;
}

function toIsoLocalDateTime(dayKeyStr, hhmm) {
  return `${dayKeyStr}T${hhmm}:00`;
}

function hhmmFromInicio(inicio) {
  return String(inicio).slice(11, 16);
}

export default function Agendamentos() {
  const { isAuthenticated, loadingAuth } = useAuth();

  const [day, setDay] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [clientes, setClientes] = useState([]);
  const [massagistas, setMassagistas] = useState([]);
  const [recursos, setRecursos] = useState([]);

  const [agendamentosDia, setAgendamentosDia] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  function abrirDetalhes(ag) {
    setSelectedAgendamento(ag);
    setDetalhesOpen(true);
  }

  const location = useLocation();
  const navigate = useNavigate();

  const slots = useMemo(() => getSlots("08:00", "18:00", 15), []);
  const currentDayKey = useMemo(() => dateKey(day), [day]);

  const dayLabel = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return fmt.format(day);
  }, [day]);

  const itemsBySlot = useMemo(() => {
    const map = {};
    for (const a of agendamentosDia) {
      const hhmm = hhmmFromInicio(a.inicio);
      const key = `${hhmm}-${a.equipamentoId}`;
      map[key] = a;
    }
    return map;
  }, [agendamentosDia]);

  async function carregarBase() {
    setLoading(true);
    setErro("");

    try {
      const [cliPage, masPage, eqpPage] = await Promise.all([
        listarClientes({ page: 0, size: 999, sortBy: "nome", direction: "ASC" }),
        listarMassagistas({ page: 0, size: 999, sortBy: "nome", direction: "ASC" }),
        listarEquipamentos({ page: 0, size: 999, sortBy: "nome", direction: "ASC" }),
      ]);

      setClientes(cliPage?.content ?? []);
      setMassagistas(masPage?.content ?? []);
      setRecursos(eqpPage?.content ?? []);
    } catch (e) {
      setErro("Não foi possível carregar dados base de agendamento.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarAgendamentosDoDia(dayKeyStr) {
    try {
      const inicioDe = `${dayKeyStr}T00:00:00`;
      const inicioAte = `${dayKeyStr}T23:59:59`;

      const page = await listarAgendamentos({
        page: 0,
        size: 999,
        sortBy: "inicio",
        direction: "ASC",
        ativo: true,
        inicioDe,
        inicioAte,
      });

      setAgendamentosDia(page?.content ?? []);
    } catch (e) {
      setErro("Não foi possível carregar os agendamentos do dia.");
      setAgendamentosDia([]);
    }
  }

  // ✅ só roda quando auth estiver pronto e autenticado
  useEffect(() => {
    if (loadingAuth) return;

    if (!isAuthenticated) {
      setLoading(false);
      setAgendamentosDia([]);
      return;
    }

    carregarBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAuth, isAuthenticated]);

  // ✅ só busca agenda quando auth estiver pronto e autenticado
  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) return;

    carregarAgendamentosDoDia(currentDayKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDayKey, loadingAuth, isAuthenticated]);

  useEffect(() => {
  if (location.state?.openAgendamentoModal) {
    // aqui você chama a sua função padrão de abrir o modal
    // (ex: abrirCriar() ou setModalOpen(true))
    abrirCriar?.();
    // ou: setModalOpen(true);

    // limpa o state pra não reabrir ao atualizar
    navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirCriar() {
    setModalOpen(true);
  }

  async function handleCreate(payload) {
    setErro("");

    const inicio = toIsoLocalDateTime(currentDayKey, payload.horario);

    try {
      await criarAgendamento({
        clienteId: payload.clienteId,
        massagistaId: payload.massagistaId,
        equipamentoId: payload.equipamentoId,
        tipoMassagem: payload.tipoMassagem,
        inicio,
        observacoes: payload.observacoes?.trim() || null,
      });

      setModalOpen(false);
      await carregarAgendamentosDoDia(currentDayKey);
    } catch (e) {
      setErro("Não foi possível criar o agendamento. Verifique os dados e tente novamente.");
    }
  }

  async function handleRemove(id) {
    const ok = window.confirm("Deseja remover este agendamento?");
    if (!ok) return;

    setErro("");

    try {
      await deletarAgendamento(id);
      await carregarAgendamentosDoDia(currentDayKey);
    } catch (e) {
      setErro("Não foi possível remover o agendamento.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Agendamentos</h1>
          <p className={styles.subtitle}>Grade horária de agendamentos</p>
        </div>

        <button className={styles.primaryBtn} type="button" onClick={abrirCriar}>
          + Novo Agendamento
        </button>
      </div>

      {loadingAuth && <div className={styles.state}>Carregando autenticação...</div>}
      {!loadingAuth && !isAuthenticated && (
        <div className={styles.error}>Você precisa estar logado para acessar os agendamentos.</div>
      )}

      {loading && <div className={styles.state}>Carregando...</div>}
      {erro && <div className={styles.error}>{erro}</div>}

      {!loading && isAuthenticated && (
        <div className={styles.card}>
          <div className={styles.calendarTop}>
            <div className={styles.navLeft}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => setDay((d) => addDays(d, -1))}
              >
                ‹
              </button>

              <div className={styles.dayLabel}>{dayLabel}</div>

              <button
                type="button"
                className={styles.navBtn}
                onClick={() => setDay((d) => addDays(d, 1))}
              >
                ›
              </button>
            </div>

            <button type="button" className={styles.todayBtn} onClick={() => setDay(new Date())}>
              Hoje
            </button>
          </div>

          <div className={styles.gridWrap}>
            <table className={styles.gridTable}>
              <thead>
                <tr>
                  <th className={styles.timeCol}>Horário</th>
                  {recursos.map((r) => (
                    <th key={r.id}>{r.nome}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {slots.map((hora) => (
                  <tr key={hora}>
                    <td className={styles.timeCell}>{hora}</td>

                    {recursos.map((r) => {
                      const key = `${hora}-${r.id}`;
                      const ag = itemsBySlot[key];

                      return (
                        <td key={r.id} className={styles.slotCell}>
                          {ag ? (
                            <div
                              className={styles.eventCard}
                              role="button"
                              tabIndex={0}
                              onClick={() => abrirDetalhes(ag)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") abrirDetalhes(ag);
                              }}
                            >
                              <div className={styles.eventContent}>
                                <strong className={styles.clientName}>{ag.clienteNome}</strong>

                                <span className={styles.details}>
                                  {ag.massagistaNome} • {ag.tipoMassagem}
                                </span>

                                <span className={styles.details}>
                                  {ag.duracaoMin} min • R$ {Number(ag.valor ?? 0).toFixed(2)}
                                </span>
                              </div>

                              <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(ag.id);
                                }}
                              >
                                Remover
                              </button>
                            </div>
                          ) : (
                            <div className={styles.emptySlot} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        <AgendamentoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          clientes={clientes}
          massagistas={massagistas}
          equipamentos={recursos}
          tiposMassagem={TIPOS_MASSAGEM}
          horarios={slots}
          onSubmit={handleCreate}
        />

        <AgendamentoDetalhesModal
          open={detalhesOpen}
          agendamento={selectedAgendamento}
          onClose={() => setDetalhesOpen(false)}
        />
    </div>
  );
}