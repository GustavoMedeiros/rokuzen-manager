package com.rokuzenmanager.controller;

import com.rokuzenmanager.dto.HistoricoResponse;
import com.rokuzenmanager.service.HistoricoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/historico")
@CrossOrigin(origins = "*")
public class HistoricoController {

    private final HistoricoService service;

    public HistoricoController(HistoricoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<HistoricoResponse> porCliente(
            @RequestParam Long clienteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "inicio") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        return ResponseEntity.ok(service.buscarPorCliente(clienteId, page, size, sortBy, direction));
    }
}