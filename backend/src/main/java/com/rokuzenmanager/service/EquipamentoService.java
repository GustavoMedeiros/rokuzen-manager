package com.rokuzenmanager.service;

import com.rokuzenmanager.entity.Equipamento;
import com.rokuzenmanager.repository.EquipamentoRepository;
import com.rokuzenmanager.entity.TipoEquipamento;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
public class EquipamentoService {

    private final EquipamentoRepository repository;

    public EquipamentoService(EquipamentoRepository repository) {
        this.repository = repository;
    }

    public Page<Equipamento> listar(String busca, Boolean ativo, int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        boolean temBusca = StringUtils.hasText(busca);

        if (temBusca && ativo != null) {
            return repository.findByNomeContainingIgnoreCaseAndAtivo(busca.trim(), ativo, pageable);
        }

        if (temBusca) {
            return repository.findByNomeContainingIgnoreCase(busca.trim(), pageable);
        }

        if (ativo != null) {
            return repository.findByAtivo(ativo, pageable);
        }

        return repository.findAll(pageable);
    }

    public Optional<Equipamento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Equipamento criar(Equipamento equipamento) {
        if (equipamento.getAtivo() == null) equipamento.setAtivo(true);
        validarTipoPermitido(equipamento.getTipo());
        return repository.save(equipamento);
    }

    public Equipamento atualizar(Long id, Equipamento payload) {
        Equipamento existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));

        existente.setNome(payload.getNome());
        existente.setTipo(payload.getTipo());
        existente.setAtivo(payload.getAtivo() != null ? payload.getAtivo() : existente.getAtivo());
        existente.setObservacoes(payload.getObservacoes());
        validarTipoPermitido(payload.getTipo());

        return repository.save(existente);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Equipamento não encontrado");
        }
        repository.deleteById(id);
    }

    private void validarTipoPermitido(String tipo){
        try{
            TipoEquipamento.valueOf(tipo);
        } catch(Exception e){
            throw new RuntimeException("Tipo de equipamento inválido: " + tipo);
        }
    } 
}