package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentStatusHistoryRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchIncidentStatusHistoryRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentStatusHistoryRequestDto;
import com.jabai.campustrack.DTOs.Responses.IncidentStatusHistoryResponseDto;
import com.jabai.campustrack.Services.IncidentStatusHistoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <h1>IncidentStatusHistoryController: CHARLES</h1>
 */
@RestController
@RequestMapping("/api/incident-status-histories")
public class IncidentStatusHistoryController {
  private final IncidentStatusHistoryService incidentStatusHistoryService;

  public IncidentStatusHistoryController(IncidentStatusHistoryService incidentStatusHistoryService) {
    this.incidentStatusHistoryService = incidentStatusHistoryService;
  }

  // Create
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
  @PostMapping
  public ResponseEntity<IncidentStatusHistoryResponseDto> create(@Valid @RequestBody CreateIncidentStatusHistoryRequestDto createIncidentStatusHistoryRequestDto) {
    IncidentStatusHistoryResponseDto incidentStatusHistoryResponseDto = incidentStatusHistoryService.create(createIncidentStatusHistoryRequestDto);
    return ResponseEntity.status(HttpStatus.CREATED).body(incidentStatusHistoryResponseDto);
  }

  // Read all
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
  @GetMapping
  public ResponseEntity<Page<IncidentStatusHistoryResponseDto>> readAll(@PageableDefault(size = 20) Pageable pageable) {
    Page<IncidentStatusHistoryResponseDto> incidentStatusHistoryResponseDtoPage = incidentStatusHistoryService.readAll(pageable);
    return ResponseEntity.ok(incidentStatusHistoryResponseDtoPage);
  }

  // Search
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
  @GetMapping("/search")
  public ResponseEntity<Page<IncidentStatusHistoryResponseDto>> search(@Valid SearchIncidentStatusHistoryRequestDto searchIncidentStatusHistoryRequestDto, @PageableDefault(size = 20) Pageable pageable) {
    Page<IncidentStatusHistoryResponseDto> incidentStatusHistoryResponseDtoPage = incidentStatusHistoryService.search(searchIncidentStatusHistoryRequestDto, pageable);
    return ResponseEntity.ok(incidentStatusHistoryResponseDtoPage);
  }

  // Read
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
  @GetMapping("/{id}")
  public ResponseEntity<IncidentStatusHistoryResponseDto> read(@PathVariable Long id) {
    IncidentStatusHistoryResponseDto incidentStatusHistoryResponseDto = incidentStatusHistoryService.read(id);
    return ResponseEntity.ok(incidentStatusHistoryResponseDto);
  }

  // Update
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
  @PatchMapping("/{id}")
  public ResponseEntity<IncidentStatusHistoryResponseDto> update(@PathVariable Long id, @Valid @RequestBody UpdateIncidentStatusHistoryRequestDto updateIncidentStatusHistoryRequestDto) {
    IncidentStatusHistoryResponseDto incidentStatusHistoryResponseDto = incidentStatusHistoryService.update(id, updateIncidentStatusHistoryRequestDto);
    return ResponseEntity.ok(incidentStatusHistoryResponseDto);
  }

  // Delete
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    incidentStatusHistoryService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
