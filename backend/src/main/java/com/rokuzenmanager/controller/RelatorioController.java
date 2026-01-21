package com.rokuzenmanager.controller;

import com.rokuzenmanager.dto.RelatorioResponse;
import com.rokuzenmanager.service.RelatorioService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioController {

    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    @Operation(summary = "Gerar relatórios por período")
    @GetMapping
    public ResponseEntity<RelatorioResponse> gerar(
            @RequestParam LocalDate inicioDe,
            @RequestParam LocalDate inicioAte
    ) {
        return ResponseEntity.ok(service.gerar(inicioDe, inicioAte));
    }
}