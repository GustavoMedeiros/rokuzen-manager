package com.rokuzenmanager.controller;

import com.rokuzenmanager.entity.Massagista;
import com.rokuzenmanager.service.MassagistaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/massagistas")
@CrossOrigin(origins = "*")
public class MassagistaController {

    private final MassagistaService service;

    public MassagistaController(MassagistaService service) {
        this.service = service;
    }

    // GET /api/massagistas?busca=&ativo=true&page=0&size=10&sortBy=nome&direction=ASC
    @GetMapping
    public ResponseEntity<Page<Massagista>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nome") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction
    ) {
        return ResponseEntity.ok(service.listar(busca, ativo, page, size, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Massagista> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Massagista> criar(@Valid @RequestBody Massagista massagista) {
        return ResponseEntity.ok(service.criar(massagista));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Massagista> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Massagista payload
    ) {
        return ResponseEntity.ok(service.atualizar(id, payload));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}