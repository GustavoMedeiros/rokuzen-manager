package com.rokuzenmanager.service;

import com.rokuzenmanager.entity.Cliente;
import com.rokuzenmanager.repository.ClienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public Page<Cliente> listar(Pageable pageable) {
        return clienteRepository.findAll(pageable);
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente criar(Cliente cliente) {
        validarCpfDuplicado(cliente.getCpf(), null);
        return clienteRepository.save(cliente);
    }

    public Cliente atualizar(Long id, Cliente clienteAtualizado) {
        Cliente existente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        validarCpfDuplicado(clienteAtualizado.getCpf(), id);

        existente.setNome(clienteAtualizado.getNome());
        existente.setTelefone(clienteAtualizado.getTelefone());
        existente.setEmail(clienteAtualizado.getEmail());
        existente.setCpf(clienteAtualizado.getCpf());
        existente.setObservacoes(clienteAtualizado.getObservacoes());

        return clienteRepository.save(existente);
    }

    public void deletar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado");
        }
        clienteRepository.deleteById(id);
    }

    private void validarCpfDuplicado(String cpf, Long idAtual) {
        if (cpf == null || cpf.isBlank()) return;

        boolean cpfExiste = clienteRepository.existsByCpf(cpf);
        if (!cpfExiste) return;

        if (idAtual == null) {
            throw new RuntimeException("CPF já cadastrado");
        }
        
        Cliente donoDoCpf = clienteRepository.findByCpf(cpf).orElse(null);
        if (donoDoCpf != null && !donoDoCpf.getId().equals(idAtual)) {
            throw new RuntimeException("CPF já cadastrado");
        }
    }
}