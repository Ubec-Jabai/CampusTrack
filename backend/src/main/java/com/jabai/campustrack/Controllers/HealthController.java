package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Responses.HealthResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
  @GetMapping
  public ResponseEntity<HealthResponseDto> health() {
    return ResponseEntity.ok(new HealthResponseDto("Ok!"));
  }
}
