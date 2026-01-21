package com.rokuzenmanager.repository;

import com.rokuzenmanager.entity.Massagista;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface MassagistaRepository extends JpaRepository<Massagista, Long> {

    Optional<Massagista> findByCpf(String cpf);

    Page<Massagista> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Massagista> findByAtivo(Boolean ativo, Pageable pageable);

    Page<Massagista> findByNomeContainingIgnoreCaseAndAtivo(String nome, Boolean ativo, Pageable pageable);

        @Query("""
        select count(m)
        from Massagista m
        where m.ativo = true
    """)
    long contarAtivos();
}