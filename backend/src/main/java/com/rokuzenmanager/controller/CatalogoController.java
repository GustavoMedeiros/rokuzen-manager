package com.rokuzenmanager.controller;

import com.rokuzenmanager.entity.TipoMassagem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/catalogos")
@CrossOrigin(origins = "*")
public class CatalogoController {

    @GetMapping("/tipos-massagem")
    public ResponseEntity<List<TipoMassagem>> listarTiposMassagem() {
        return ResponseEntity.ok(Arrays.asList(TipoMassagem.values()));
    }
}