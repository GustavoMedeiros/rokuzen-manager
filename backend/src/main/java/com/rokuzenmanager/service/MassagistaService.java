package com.rokuzenmanager.service;

import com.rokuzenmanager.entity.Massagista;
import com.rokuzenmanager.repository.MassagistaRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
public class MassagistaService {

    private final MassagistaRepository repository;

    public MassagistaService(MassagistaRepository repository) {
        this.repository = repository;
    }

    public Page<Massagista> listar(String busca, Boolean ativo, int page, int size, String sortBy, String direction) {
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

    public Optional<Massagista> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Massagista criar(Massagista massagista) {
        validarCpfUnico(massagista.getCpf(), null);
        if (massagista.getAtivo() == null) massagista.setAtivo(true);
        return repository.save(massagista);
    }

    public Massagista atualizar(Long id, Massagista payload) {
        Massagista existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Massagista não encontrado"));

        validarCpfUnico(payload.getCpf(), id);

        existente.setNome(payload.getNome());
        existente.setTelefone(payload.getTelefone());
        existente.setEmail(payload.getEmail());
        existente.setCpf(payload.getCpf());
        existente.setAtivo(payload.getAtivo() != null ? payload.getAtivo() : existente.getAtivo());
        existente.setObservacoes(payload.getObservacoes());

        return repository.save(existente);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Massagista não encontrado");
        }
        repository.deleteById(id);
    }

    private void validarCpfUnico(String cpf, Long idAtual) {
        if (!StringUtils.hasText(cpf)) return;

        repository.findByCpf(cpf.trim())
                .ifPresent(encontrado -> {
                    if (idAtual == null || !encontrado.getId().equals(idAtual)) {
                        throw new RuntimeException("CPF já cadastrado");
                    }
                });
    }
}