package com.rokuzenmanager.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FaturamentoDiarioDTO(
        LocalDate data,
        BigDecimal valor
) {}