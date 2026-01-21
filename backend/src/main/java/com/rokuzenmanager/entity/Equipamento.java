package com.rokuzenmanager.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "equipamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Tipo é obrigatório")
    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Size(max = 500, message = "Observações deve ter no máximo 500 caracteres")
    @Column(columnDefinition = "TEXT")
    private String observacoes;
}