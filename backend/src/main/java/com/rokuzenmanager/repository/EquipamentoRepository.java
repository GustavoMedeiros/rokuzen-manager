package com.rokuzenmanager.repository;

import com.rokuzenmanager.entity.Equipamento;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EquipamentoRepository extends JpaRepository<Equipamento, Long> {

    Page<Equipamento> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Equipamento> findByAtivo(Boolean ativo, Pageable pageable);

    Page<Equipamento> findByNomeContainingIgnoreCaseAndAtivo(String nome, Boolean ativo, Pageable pageable);

        @Query("""
        select e.nome
        from Equipamento e
        where e.ativo = true
    """)
    List<String> listarNomesAtivos();
}