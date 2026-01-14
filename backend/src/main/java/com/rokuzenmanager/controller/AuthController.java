package com.rokuzenmanager.controller;

import com.rokuzenmanager.dto.LoginRequestDTO;
import com.rokuzenmanager.dto.LoginResponseDTO;
import com.rokuzenmanager.entity.Usuario;
import com.rokuzenmanager.config.security.JwtService;
import com.rokuzenmanager.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public AuthController(UsuarioService usuarioService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO request
    ) {
        Usuario usuario = usuarioService.autenticar(
                request.getUsuario(),
                request.getSenha()
        );

        String token = jwtService.gerarToken(usuario);

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @GetMapping("/perfil")
    public Usuario perfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Usuario) auth.getPrincipal();
    }
}