package com.rokuzenmanager.service;

import com.rokuzenmanager.dto.AgendamentoResponse;
import com.rokuzenmanager.dto.HistoricoResponse;
import com.rokuzenmanager.entity.Agendamento;
import com.rokuzenmanager.repository.AgendamentoRepository;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class HistoricoService {

    private final AgendamentoRepository agendamentoRepository;
    private final AgendamentoService agendamentoService;

    public HistoricoService(AgendamentoRepository agendamentoRepository, AgendamentoService agendamentoService) {
        this.agendamentoRepository = agendamentoRepository;
        this.agendamentoService = agendamentoService;
    }

    public HistoricoResponse buscarPorCliente(Long clienteId, int page, int size, String sortBy, String direction) {
        if (clienteId == null || clienteId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clienteId é obrigatório.");
        }

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Agendamento> agPage = agendamentoRepository.listarHistoricoPorCliente(clienteId, pageable);
        Page<AgendamentoResponse> responsePage = agPage.map(agendamentoService::toResponse);

        long total = agendamentoRepository.contarHistoricoPorCliente(clienteId);
        BigDecimal valorTotal = agendamentoRepository.somarValorHistoricoPorCliente(clienteId);

        BigDecimal ticketMedio = BigDecimal.ZERO;
        if (total > 0) {
            ticketMedio = valorTotal.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
        }

        return new HistoricoResponse(
                clienteId,
                total,
                valorTotal.setScale(2, RoundingMode.HALF_UP),
                ticketMedio,
                responsePage
        );
    }
}