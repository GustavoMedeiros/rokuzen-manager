package com.rokuzenmanager.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        long agendamentosHoje,
        long totalClientes,
        long massagistasAtivos,
        BigDecimal faturamentoMes,
        List<EquipamentoDisponivelDTO> equipamentosDisponiveis
) {}