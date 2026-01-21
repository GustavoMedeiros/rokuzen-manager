package com.rokuzenmanager.dto;

import java.math.BigDecimal;

public record IndicadoresDTO(
        long totalAtendimentos,
        BigDecimal faturamentoTotal,
        BigDecimal ticketMedio
) {}