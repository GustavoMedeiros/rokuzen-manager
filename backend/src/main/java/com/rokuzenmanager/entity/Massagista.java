package com.rokuzenmanager.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "massagistas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Massagista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Telefone é obrigatório")
    @Column(nullable = false)
    private String telefone;

    @Email(message = "Email inválido")
    @Column
    private String email;

    @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres")
    @Column(unique = true, length = 14)
    private String cpf;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(columnDefinition = "TEXT")
    private String observacoes;
}