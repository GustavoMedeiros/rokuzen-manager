package com.rokuzenmanager.controller;

import com.rokuzenmanager.dto.DashboardResponse;
import com.rokuzenmanager.service.DashboardService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Obter dados do dashboard")
    @GetMapping
    public DashboardResponse obter() {
        return dashboardService.obter();
    }
}