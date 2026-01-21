package com.rokuzenmanager.service;

import com.rokuzenmanager.dto.DashboardResponse;
import com.rokuzenmanager.dto.EquipamentoDisponivelDTO;
import com.rokuzenmanager.repository.AgendamentoRepository;
import com.rokuzenmanager.repository.ClienteRepository;
import com.rokuzenmanager.repository.EquipamentoRepository;
import com.rokuzenmanager.repository.MassagistaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AgendamentoRepository agendamentoRepository;
    private final ClienteRepository clienteRepository;
    private final MassagistaRepository massagistaRepository;
    private final EquipamentoRepository equipamentoRepository;

    public DashboardService(
            AgendamentoRepository agendamentoRepository,
            ClienteRepository clienteRepository,
            MassagistaRepository massagistaRepository,
            EquipamentoRepository equipamentoRepository
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.clienteRepository = clienteRepository;
        this.massagistaRepository = massagistaRepository;
        this.equipamentoRepository = equipamentoRepository;
    }

    public DashboardResponse obter() {
        ZoneId zone = ZoneId.systemDefault();

        // Hoje
        LocalDate hoje = LocalDate.now(zone);
        LocalDateTime inicioHoje = hoje.atStartOfDay();
        LocalDateTime fimHoje = hoje.plusDays(1).atStartOfDay();

        long agendamentosHoje = agendamentoRepository.contarAtendimentosPeriodo(inicioHoje, fimHoje);

        // Total clientes
        long totalClientes = clienteRepository.count();

        // Massagistas ativos
        long massagistasAtivos = massagistaRepository.contarAtivos();

        // Faturamento do mês (mês corrente)
        LocalDate primeiroDiaMes = hoje.withDayOfMonth(1);
        LocalDateTime inicioMes = primeiroDiaMes.atStartOfDay();
        LocalDateTime fimMes = primeiroDiaMes.plusMonths(1).atStartOfDay();

        BigDecimal faturamentoMes = Optional
                .ofNullable(agendamentoRepository.somarFaturamentoPeriodo(inicioMes, fimMes))
                .orElse(BigDecimal.ZERO);

        // Recursos disponíveis (agrupados por "grupo" via nome)
        List<String> nomes = equipamentoRepository.listarNomesAtivos();
        List<EquipamentoDisponivelDTO> recursos = agruparRecursosPorNome(nomes);

        return new DashboardResponse(
                agendamentosHoje,
                totalClientes,
                massagistasAtivos,
                faturamentoMes,
                recursos
        );
    }

    private List<EquipamentoDisponivelDTO> agruparRecursosPorNome(List<String> nomes) {
        if (nomes == null || nomes.isEmpty()) return List.of();

        Map<String, Long> map = nomes.stream()
                .map(this::normalizarGrupo)
                .collect(Collectors.groupingBy(g -> g, LinkedHashMap::new, Collectors.counting()));

        // Ordem "bonita" (como print)
        List<String> ordem = List.of(
                "Macas Superiores",
                "Macas Inferiores",
                "Cadeiras Rápidas",
                "Reflexologia",
                "Flex",
                "Outros"
        );

        List<EquipamentoDisponivelDTO> out = new ArrayList<>();
        for (String key : ordem) {
            if (map.containsKey(key)) out.add(new EquipamentoDisponivelDTO(key, map.get(key)));
        }

        // Qualquer grupo que não entrou acima
        for (var e : map.entrySet()) {
            if (ordem.contains(e.getKey())) continue;
            out.add(new EquipamentoDisponivelDTO(e.getKey(), e.getValue()));
        }

        return out;
    }

    private String normalizarGrupo(String nome) {
        String n = (nome == null ? "" : nome).toLowerCase(Locale.ROOT);

        if (n.contains("maca superior") || (n.contains("maca") && n.contains("superior"))) return "Macas Superiores";
        if (n.contains("maca inferior") || (n.contains("maca") && n.contains("inferior"))) return "Macas Inferiores";
        if (n.contains("cadeira") || n.contains("rápida") || n.contains("rapida")) return "Cadeiras Rápidas";
        if (n.contains("reflex")) return "Reflexologia";
        if (n.contains("flex")) return "Flex";

        // fallback:
        if (n.contains("maca")) return "Macas";
        return "Outros";
    }
}