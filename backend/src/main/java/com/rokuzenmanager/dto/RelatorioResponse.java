package com.rokuzenmanager.dto;

import java.util.List;

public record RelatorioResponse(
        IndicadoresDTO indicadores,
        List<FaturamentoDiarioDTO> faturamentoDiario,
        List<OcupacaoEquipamentoDTO> ocupacaoPorEquipamento
) {}