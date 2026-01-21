package com.rokuzenmanager.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamentos reais
    @NotNull(message = "Cliente é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotNull(message = "Massagista é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "massagista_id", nullable = false)
    private Massagista massagista;

    @NotNull(message = "Equipamento é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipamento_id", nullable = false)
    private Equipamento equipamento;

    // Catálogo fixo
    @NotNull(message = "Tipo de massagem é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMassagem tipoMassagem;

    // Horários
    @NotNull(message = "Início é obrigatório")
    @Column(nullable = false)
    private LocalDateTime inicio;

    @NotNull(message = "Fim é obrigatório")
    @Column(nullable = false)
    private LocalDateTime fim;

    // Snapshot
    @NotNull(message = "Duração é obrigatória")
    @Min(value = 5, message = "Duração mínima é 5 minutos")
    @Max(value = 240, message = "Duração máxima é 240 minutos")
    @Column(nullable = false)
    private Integer duracaoMin;

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.0", inclusive = false, message = "Valor deve ser maior que 0")
    @Digits(integer = 10, fraction = 2, message = "Valor inválido")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false)
    private Boolean ativo = true;
}