package com.rokuzenmanager.service;

import com.rokuzenmanager.entity.Usuario;
import com.rokuzenmanager.repository.UsuarioRepository;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;


    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder){
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /* Busca por Login */
    public Optional<Usuario> buscarPorUsuario(String usuario){
        return usuarioRepository.findByUsuario(usuario);
    }

    /* Cria um usuário */
    public Usuario salvar(Usuario usuario){
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    /* Verifica se já existe um usuário com o mesmo login */
    public boolean existePorUsuario(String usuario){
        return usuarioRepository.findByUsuario(usuario).isPresent();
    }

    public Usuario autenticar(String usuario, String senha) {
        Usuario user = usuarioRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(senha, user.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        return user;
    }
}