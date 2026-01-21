package com.rokuzenmanager.dto;

import com.rokuzenmanager.entity.TipoMassagem;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AgendamentoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        Long massagistaId,
        String massagistaNome,
        Long equipamentoId,
        String equipamentoNome,
        TipoMassagem tipoMassagem,
        Integer duracaoMin,
        BigDecimal valor,
        LocalDateTime inicio,
        LocalDateTime fim,
        String observacoes,
        Boolean ativo
) {}