package com.rokuzenmanager.config.security;

import com.rokuzenmanager.entity.Usuario;
import com.rokuzenmanager.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("========== JWT FILTER ==========");
        System.out.println("PATH: " + request.getServletPath());
        System.out.println("METHOD: " + request.getMethod());

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        System.out.println("AUTH HEADER: " + authHeader);

        // Se já está autenticado
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            System.out.println("Já autenticado no SecurityContext");
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Header Authorization ausente ou inválido");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        System.out.println("TOKEN EXTRAÍDO: " + token);
        System.out.println("[JWT] TOKEN LEN: " + token.length());

        if (!jwtService.tokenValido(token)) {
            System.out.println("TOKEN INVÁLIDO");
            filterChain.doFilter(request, response);
            return;
        }

        String username = jwtService.extrairUsuario(token);
        System.out.println("USUÁRIO EXTRAÍDO DO TOKEN: " + username);

        Usuario usuario = usuarioRepository.findByUsuario(username).orElse(null);
        System.out.println("USUÁRIO ENCONTRADO NO BANCO: " + usuario);

        if (usuario == null) {
            System.out.println("Usuário não encontrado");
            filterChain.doFilter(request, response);
            return;
        }

        var authentication = new UsernamePasswordAuthenticationToken(
                usuario,
                null,
                Collections.emptyList()
        );

        authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        System.out.println("AUTENTICAÇÃO SETADA COM SUCESSO");
        System.out.println("================================");

        filterChain.doFilter(request, response);
    }
}