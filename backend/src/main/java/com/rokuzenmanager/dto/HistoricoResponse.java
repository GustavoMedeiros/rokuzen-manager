package com.rokuzenmanager.dto;

import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public record HistoricoResponse(
        Long clienteId,
        long totalAtendimentos,
        BigDecimal valorTotalGasto,
        BigDecimal ticketMedio,
        Page<AgendamentoResponse> atendimentos
) {}