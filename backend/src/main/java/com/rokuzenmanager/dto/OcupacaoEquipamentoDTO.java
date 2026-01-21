package com.rokuzenmanager.dto;

public record OcupacaoEquipamentoDTO(
        Long equipamentoId,
        String equipamentoNome,
        long totalAgendamentos
) {}