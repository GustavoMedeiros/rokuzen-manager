package com.rokuzenmanager.service;

import com.rokuzenmanager.dto.*;
import com.rokuzenmanager.repository.AgendamentoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RelatorioService {

    private final AgendamentoRepository repository;

    public RelatorioService(AgendamentoRepository repository) {
        this.repository = repository;
    }

    public RelatorioResponse gerar(LocalDate inicioDe, LocalDate inicioAte) {
        if (inicioDe == null || inicioAte == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "inicioDe e inicioAte são obrigatórios.");
        }
        if (inicioAte.isBefore(inicioDe)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data fim não pode ser menor que data início.");
        }

        LocalDateTime inicio = inicioDe.atStartOfDay();
        LocalDateTime fim = inicioAte.atTime(23, 59, 59);

        long total = repository.contarAtendimentosPeriodo(inicio, fim);
        BigDecimal faturamento = repository.somarFaturamentoPeriodo(inicio, fim);

        if (faturamento == null) faturamento = BigDecimal.ZERO;

        BigDecimal ticketMedio = total > 0
                ? faturamento.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        var indicadores = new IndicadoresDTO(
                total,
                faturamento.setScale(2, RoundingMode.HALF_UP),
                ticketMedio
        );

        List<FaturamentoDiarioDTO> faturamentoDiario = repository.faturamentoDiario(inicio, fim).stream()
                .map(row -> {
                    LocalDate data = ((Date) row[0]).toLocalDate();
                    BigDecimal valor = (BigDecimal) row[1];
                    if (valor == null) valor = BigDecimal.ZERO;
                    return new FaturamentoDiarioDTO(data, valor.setScale(2, RoundingMode.HALF_UP));
                })
                .toList();

        List<OcupacaoEquipamentoDTO> ocupacaoPorRecurso = repository.ocupacaoPorEquipamento(inicio, fim).stream()
                .map(row -> new OcupacaoEquipamentoDTO(
                        (Long) row[0],
                        (String) row[1],
                        (Long) row[2]
                ))
                .toList();

        return new RelatorioResponse(indicadores, faturamentoDiario, ocupacaoPorRecurso);
    }
}