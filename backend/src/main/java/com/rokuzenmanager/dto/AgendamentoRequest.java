package com.rokuzenmanager.dto;

import com.rokuzenmanager.entity.TipoMassagem;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record AgendamentoRequest(
        @NotNull Long clienteId,
        @NotNull Long massagistaId,
        @NotNull Long equipamentoId,
        @NotNull TipoMassagem tipoMassagem,
        @NotNull LocalDateTime inicio,
        String observacoes
) {}