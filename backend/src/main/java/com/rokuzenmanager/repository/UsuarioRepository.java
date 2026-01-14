package com.rokuzenmanager.repository;

import com.rokuzenmanager.entity.Usuario;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UsuarioRepository extends JpaRepository <Usuario, Long>{

    Optional<Usuario> findByUsuario(String usuario);
    
}