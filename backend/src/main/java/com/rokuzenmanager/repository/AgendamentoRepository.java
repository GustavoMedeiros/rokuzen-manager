package com.rokuzenmanager.repository;

import com.rokuzenmanager.entity.Agendamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

import java.time.LocalDateTime;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

      // ===== RELATÓRIOS (POR PERÍODO) =====

    @Query("""
        select count(a)
        from Agendamento a
        where a.ativo = true
          and a.inicio between :inicio and :fim
    """)
    long contarAtendimentosPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        select coalesce(sum(a.valor), 0)
        from Agendamento a
        where a.ativo = true
          and a.inicio between :inicio and :fim
    """)
    BigDecimal somarFaturamentoPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        select date(a.inicio), coalesce(sum(a.valor), 0)
        from Agendamento a
        where a.ativo = true
          and a.inicio between :inicio and :fim
        group by date(a.inicio)
        order by date(a.inicio)
    """)
    java.util.List<Object[]> faturamentoDiario(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        select e.id, e.nome, count(a)
        from Agendamento a
        join a.equipamento e
        where a.ativo = true
          and a.inicio between :inicio and :fim
        group by e.id, e.nome
        order by count(a) desc
    """)
    java.util.List<Object[]> ocupacaoPorEquipamento(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
    
    // ===== HISTÓRICO POR CLIENTE =====

    @Query("""
        select a
        from Agendamento a
        where a.cliente.id = :clienteId
          and a.ativo = true
    """)
    Page<Agendamento> listarHistoricoPorCliente(
            @Param("clienteId") Long clienteId,
            Pageable pageable
    );

    @Query("""
        select count(a)
        from Agendamento a
        where a.cliente.id = :clienteId
          and a.ativo = true
    """)
    long contarHistoricoPorCliente(@Param("clienteId") Long clienteId);

    @Query("""
        select coalesce(sum(a.valor), 0)
        from Agendamento a
        where a.cliente.id = :clienteId
          and a.ativo = true
    """)
    BigDecimal somarValorHistoricoPorCliente(@Param("clienteId") Long clienteId);

    @Query("""
        select case when count(a) > 0 then true else false end
        from Agendamento a
        where a.ativo = true
          and a.massagista.id = :massagistaId
          and a.inicio < :fim
          and a.fim > :inicio
          and (:ignoreId is null or a.id <> :ignoreId)
    """)
    boolean existeConflitoMassagista(
            @Param("massagistaId") Long massagistaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("ignoreId") Long ignoreId
    );

    @Query("""
        select case when count(a) > 0 then true else false end
        from Agendamento a
        where a.ativo = true
          and a.equipamento.id = :equipamentoId
          and a.inicio < :fim
          and a.fim > :inicio
          and (:ignoreId is null or a.id <> :ignoreId)
    """)
    boolean existeConflitoEquipamento(
            @Param("equipamentoId") Long equipamentoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("ignoreId") Long ignoreId
    );

    Page<Agendamento> findByAtivo(Boolean ativo, Pageable pageable);

    Page<Agendamento> findByInicioBetween(LocalDateTime inicioDe, LocalDateTime inicioAte, Pageable pageable);

    Page<Agendamento> findByAtivoAndInicioBetween(Boolean ativo, LocalDateTime inicioDe, LocalDateTime inicioAte, Pageable pageable);
}