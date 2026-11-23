package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Responses.StatisticsResponseDto;
import com.jabai.campustrack.DTOs.Responses.WorkerStatisticsResponseDto;
import com.jabai.campustrack.Services.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping
    public ResponseEntity<StatisticsResponseDto> getAdminStatistics() {
        return ResponseEntity.ok(statisticsService.getAdminStatistics());
    }

    @GetMapping("/worker")
    public ResponseEntity<WorkerStatisticsResponseDto> getWorkerStatistics(Authentication authentication) {
        return ResponseEntity.ok(statisticsService.getWorkerStatistics(Long.parseLong(authentication.getName())));
    }
}
