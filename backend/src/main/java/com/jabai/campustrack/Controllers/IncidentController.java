package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Responses.IncidentResponseDto;
import com.jabai.campustrack.Services.IncidentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <h1>IncidentController: JOHN LOUIE </h1>
 *
 * <p>JADE: Palihug lang ko ug follow up sa mga user roles ari</p>
 */
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
  private final IncidentService incidentService;

  public IncidentController(IncidentService incidentService) {
    this.incidentService = incidentService;
  }

  // Create
  // admin can report for anyone, others can only report under their own account - CHRIS CHAN
  @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('WORKER', 'STUDENT') and #request.reportedById.toString() == authentication.name)")
  @PostMapping
  public ResponseEntity<IncidentResponseDto> createIncident(@Valid @RequestBody CreateIncidentRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.createIncident(request));
  }

  // Read all
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER', 'STUDENT')")
  @GetMapping
  public ResponseEntity<Page<IncidentResponseDto>> getIncidents(@PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(incidentService.getIncidents(pageable));
  }

  // Search
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER', 'STUDENT')")
  @GetMapping("/search")
  public ResponseEntity<Page<IncidentResponseDto>> searchIncidents(@Valid SearchIncidentRequestDto request, @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(incidentService.searchIncidents(request, pageable));
  }

  // Read
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER', 'STUDENT')")
  @GetMapping("/{id}")
  public ResponseEntity<IncidentResponseDto> getIncident(@PathVariable Long id) {
    return ResponseEntity.ok(incidentService.getIncident(id));
  }

  // Update
  // admin or the owner of the incident only - CHRIS CHAN
  @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('WORKER', 'STUDENT') and #request.assignedToId == null and @incidentService.isOwner(#id, authentication.name))")
  @PatchMapping("/{id}")
  public ResponseEntity<IncidentResponseDto> updateIncident(@PathVariable Long id, @Valid @RequestBody UpdateIncidentRequestDto request) {
    return ResponseEntity.ok(incidentService.updateIncident(id, request));
  }

  // Delete
  // admin or the owner of the incident only- CHRIS CHAN
  @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('WORKER', 'STUDENT') and @incidentService.isOwner(#id, authentication.name))")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
    incidentService.deleteIncident(id);
    return ResponseEntity.noContent().build();
  }
}