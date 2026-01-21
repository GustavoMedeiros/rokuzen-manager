package com.rokuzenmanager.service;

import com.rokuzenmanager.dto.AgendamentoRequest;
import com.rokuzenmanager.dto.AgendamentoResponse;
import com.rokuzenmanager.entity.*;
import com.rokuzenmanager.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.Optional;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final ClienteRepository clienteRepository;
    private final MassagistaRepository massagistaRepository;
    private final EquipamentoRepository equipamentoRepository;

    public AgendamentoService(
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

    public Page<AgendamentoResponse> listar(Boolean ativo,
                                           LocalDateTime inicioDe,
                                           LocalDateTime inicioAte,
                                           int page, int size, String sortBy, String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Agendamento> p;

        boolean temPeriodo = (inicioDe != null && inicioAte != null);

        if (temPeriodo && ativo != null) {
            p = agendamentoRepository.findByAtivoAndInicioBetween(ativo, inicioDe, inicioAte, pageable);
        } else if (temPeriodo) {
            p = agendamentoRepository.findByInicioBetween(inicioDe, inicioAte, pageable);
        } else if (ativo != null) {
            p = agendamentoRepository.findByAtivo(ativo, pageable);
        } else {
            p = agendamentoRepository.findAll(pageable);
        }

        return p.map(this::toResponse);
    }

    public Page<AgendamentoResponse> listar(Boolean ativo, int page, int size, String sortBy, String direction) {
        return listar(ativo, null, null, page, size, sortBy, direction);
    }

    public Optional<AgendamentoResponse> buscarPorId(Long id) {
        return agendamentoRepository.findById(id).map(this::toResponse);
    }

    public AgendamentoResponse criar(AgendamentoRequest req) {
        Cliente cliente = clienteRepository.findById(req.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));

        Massagista massagista = massagistaRepository.findById(req.massagistaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Massagista não encontrado"));

        Equipamento equipamento = equipamentoRepository.findById(req.equipamentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipamento não encontrado"));

        try {
            validarAtivos(cliente, massagista, equipamento);

            TipoMassagem tipo = req.tipoMassagem();
            int duracao = tipo.getDuracaoMin();
            var valor = tipo.getPreco();

            LocalDateTime inicio = req.inicio();
            LocalDateTime fim = inicio.plusMinutes(duracao);

            validarHorario(inicio, fim);

            // se houver conflito, a gente quer 409 (não 500)
            validarConflitos(massagista.getId(), equipamento.getId(), inicio, fim, null);

            Agendamento ag = new Agendamento();
            ag.setCliente(cliente);
            ag.setMassagista(massagista);
            ag.setEquipamento(equipamento);
            ag.setTipoMassagem(tipo);
            ag.setDuracaoMin(duracao);
            ag.setValor(valor);
            ag.setInicio(inicio);
            ag.setFim(fim);
            ag.setObservacoes(StringUtils.hasText(req.observacoes()) ? req.observacoes().trim() : null);
            ag.setAtivo(true);

            return toResponse(agendamentoRepository.save(ag));
        } catch (IllegalArgumentException e) {
            // regras como: horário inválido, entidade inativa, etc.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (ResponseStatusException e) {
            // se algum método interno já lançar com status certo
            throw e;
        } catch (RuntimeException e) {
            // aqui é o pulo do gato: conflitos viram 409
            // (se seus métodos hoje jogam RuntimeException para conflito)
            String msg = e.getMessage() != null ? e.getMessage() : "Conflito de agenda";
            if (msg.toLowerCase().contains("conflit") || msg.toLowerCase().contains("ocupad")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, msg, e);
            }
            throw e; // deixa estourar como 500 pra erro inesperado
        }
    }

    public AgendamentoResponse atualizar(Long id, AgendamentoRequest req) {
        Agendamento ag = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        Cliente cliente = clienteRepository.findById(req.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Massagista massagista = massagistaRepository.findById(req.massagistaId())
                .orElseThrow(() -> new RuntimeException("Massagista não encontrado"));

        Equipamento equipamento = equipamentoRepository.findById(req.equipamentoId())
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));

        validarAtivos(cliente, massagista, equipamento);

        TipoMassagem tipo = req.tipoMassagem();
        int duracao = tipo.getDuracaoMin();
        var valor = tipo.getPreco();

        LocalDateTime inicio = req.inicio();
        LocalDateTime fim = inicio.plusMinutes(duracao);

        validarHorario(inicio, fim);
        validarConflitos(massagista.getId(), equipamento.getId(), inicio, fim, ag.getId());

        ag.setCliente(cliente);
        ag.setMassagista(massagista);
        ag.setEquipamento(equipamento);
        ag.setTipoMassagem(tipo);
        ag.setDuracaoMin(duracao);
        ag.setValor(valor);
        ag.setInicio(inicio);
        ag.setFim(fim);
        ag.setObservacoes(StringUtils.hasText(req.observacoes()) ? req.observacoes().trim() : null);

        return toResponse(agendamentoRepository.save(ag));
    }

    public void excluir(Long id) {
        if (!agendamentoRepository.existsById(id)) throw new RuntimeException("Agendamento não encontrado");
        agendamentoRepository.deleteById(id);
    }

    private void validarHorario(LocalDateTime inicio, LocalDateTime fim) {
        if (!fim.isAfter(inicio)) throw new RuntimeException("Horário inválido.");

        LocalTime hIni = inicio.toLocalTime();
        LocalTime hFim = fim.toLocalTime();

        LocalTime abertura = LocalTime.of(8, 0);
        LocalTime fechamento = LocalTime.of(20, 0);

        if (hIni.isBefore(abertura) || hFim.isAfter(fechamento)) {
            throw new RuntimeException("Fora do horário de funcionamento.");
        }
    }

    private void validarConflitos(
            Long massagistaId,
            Long equipamentoId,
            LocalDateTime inicio,
            LocalDateTime fim,
            Long ignoreId
    ) {
        if (agendamentoRepository.existeConflitoMassagista(massagistaId, inicio, fim, ignoreId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Conflito de horário: massagista indisponível."
            );
        }

        if (agendamentoRepository.existeConflitoEquipamento(equipamentoId, inicio, fim, ignoreId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Conflito de horário: equipamento indisponível."
            );
        }
    }

    private void validarAtivos(Cliente c, Massagista m, Equipamento e) {
        if (Boolean.FALSE.equals(m.getAtivo())) throw new RuntimeException("Massagista inativo.");
        if (Boolean.FALSE.equals(e.getAtivo())) throw new RuntimeException("Equipamento inativo.");
    }

    public AgendamentoResponse toResponse(Agendamento a) {
        return new AgendamentoResponse(
                a.getId(),
                a.getCliente().getId(),
                a.getCliente().getNome(),
                a.getMassagista().getId(),
                a.getMassagista().getNome(),
                a.getEquipamento().getId(),
                a.getEquipamento().getNome(),
                a.getTipoMassagem(),
                a.getDuracaoMin(),
                a.getValor(),
                a.getInicio(),
                a.getFim(),
                a.getObservacoes(),
                a.getAtivo()
        );
    }
}