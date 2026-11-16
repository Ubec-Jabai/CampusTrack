package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateWorkerSpecialtyRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchWorkerSpecialtyRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateWorkerSpecialtyRequestDto;
import com.jabai.campustrack.DTOs.Responses.WorkerSpecialtyResponseDto;
import com.jabai.campustrack.Models.Enums.Specialty;
import com.jabai.campustrack.Services.WorkerSpecialtyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <h1>WorkerSpecialtyController: CHARLES</h1>
 */
@RestController
@RequestMapping("/api/worker-specialties")
public class WorkerSpecialtyController {
  private final WorkerSpecialtyService workerSpecialtyService;

  public WorkerSpecialtyController(WorkerSpecialtyService workerSpecialtyService) {
    this.workerSpecialtyService = workerSpecialtyService;
  }

  // Create
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public ResponseEntity<WorkerSpecialtyResponseDto> create(@Valid @RequestBody CreateWorkerSpecialtyRequestDto createWorkerSpecialtyRequestDto) {
    WorkerSpecialtyResponseDto workerSpecialtyResponseDto = workerSpecialtyService.create(createWorkerSpecialtyRequestDto);
    return ResponseEntity.status(HttpStatus.CREATED).body(workerSpecialtyResponseDto);
  }

  // Read all
  @GetMapping
  public ResponseEntity<Page<WorkerSpecialtyResponseDto>> readAll(@PageableDefault(size = 20) Pageable pageable) {
    Page<WorkerSpecialtyResponseDto> workerSpecialtyResponseDtoPage = workerSpecialtyService.readAll(pageable);
    return ResponseEntity.ok(workerSpecialtyResponseDtoPage);
  }

  // Read
  @GetMapping("/{userId}/{specialty}")
  public ResponseEntity<WorkerSpecialtyResponseDto> read(@PathVariable Long userId, @PathVariable Specialty specialty) {
    WorkerSpecialtyResponseDto workerSpecialtyResponseDto = workerSpecialtyService.read(userId, specialty);
    return ResponseEntity.ok(workerSpecialtyResponseDto);
  }

  // Search
  @GetMapping("/search")
  public ResponseEntity<Page<WorkerSpecialtyResponseDto>> search(@Valid SearchWorkerSpecialtyRequestDto searchWorkerSpecialtyRequestDto, @PageableDefault(size = 20) Pageable pageable) {
    Page<WorkerSpecialtyResponseDto> workerSpecialtyResponseDtoPage = workerSpecialtyService.search(searchWorkerSpecialtyRequestDto, pageable);
    return ResponseEntity.ok(workerSpecialtyResponseDtoPage);
  }

  // Update
  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{userId}/{specialty}")
  public ResponseEntity<WorkerSpecialtyResponseDto> update(@PathVariable Long userId, @PathVariable Specialty specialty, @Valid @RequestBody UpdateWorkerSpecialtyRequestDto updateWorkerSpecialtyRequestDto) {
    WorkerSpecialtyResponseDto workerSpecialtyResponseDto = workerSpecialtyService.update(userId, specialty, updateWorkerSpecialtyRequestDto);
    return ResponseEntity.ok(workerSpecialtyResponseDto);
  }

  // Delete
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{userId}/{specialty}")
  public ResponseEntity<Void> delete(@PathVariable Long userId, @PathVariable Specialty specialty) {
    workerSpecialtyService.delete(userId, specialty);
    return ResponseEntity.noContent().build();
  }
}
