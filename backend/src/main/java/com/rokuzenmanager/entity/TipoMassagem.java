package com.rokuzenmanager.entity;

import java.math.BigDecimal;

public enum TipoMassagem {

    MACA("Maca", 60, new BigDecimal("120.00")),
    RAPIDA("Rápida", 30, new BigDecimal("80.00")),
    REFLEXOLOGIA("Reflexologia", 45, new BigDecimal("100.00")),
    FLEX("Flex", 60, new BigDecimal("150.00"));

    private final String label;
    private final int duracaoMin;
    private final BigDecimal preco;

    TipoMassagem(String label, int duracaoMin, BigDecimal preco) {
        this.label = label;
        this.duracaoMin = duracaoMin;
        this.preco = preco;
    }

    public String getLabel() { return label; }
    public int getDuracaoMin() { return duracaoMin; }
    public BigDecimal getPreco() { return preco; }
}