package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Responses.IncidentResponseDto;
import com.jabai.campustrack.Services.IncidentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * <h4>NOTE: DO NOT VIOLATE LAYERS STRUCTURE.</h4>
 * <br/>
 * <p>JOHN LOUIE: Perform CRUD operations para sa Incidents table</p>
 * <br/>
 * <p>Layer structure:</p>
 * <ul>
 *   <li>Controller layer -> DTO (with annotations)</li>
 *   <li>Service layer -> DTO</li>
 *   <li>Repository layer -> Model</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
  private final IncidentService incidentService;

  public IncidentController(IncidentService incidentService) {
    this.incidentService = incidentService;
  }

  @PostMapping
  public ResponseEntity<IncidentResponseDto> createIncident(@Valid @RequestBody CreateIncidentRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.createIncident(request));
  }

  @GetMapping
  public ResponseEntity<Page<IncidentResponseDto>> getIncidents(
      @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(incidentService.getIncidents(pageable));
  }

  @GetMapping("/{id}")
  public ResponseEntity<IncidentResponseDto> getIncident(@PathVariable Long id) {
    return ResponseEntity.ok(incidentService.getIncident(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<IncidentResponseDto> updateIncident(@PathVariable Long id,
      @Valid @RequestBody UpdateIncidentRequestDto request) {
    return ResponseEntity.ok(incidentService.updateIncident(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
    incidentService.deleteIncident(id);
    return ResponseEntity.noContent().build();
  }
}
