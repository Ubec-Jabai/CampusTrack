package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateNfcTagRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateNfcTagRequestDto;
import com.jabai.campustrack.DTOs.Responses.NfcTagResponseDto;
import com.jabai.campustrack.Services.NfcTagService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * <p>NOTE: DO NOT VIOLATE LAYERS STRUCTURE.</p>
 *
 * <p>CHARLES: Perform CRUD operations para sa Nfc Tags table</p>
 *
 * <p>Layer structure:</p>
 * <ul>
 *   <li>Controller layer -> DTO (with annotations)</li>
 *   <li>Service layer -> DTO</li>
 *   <li>Repository layer -> Model</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/nfc-tags")
public class NfcTagController {
  private final NfcTagService nfcTagService;

  public NfcTagController(NfcTagService nfcTagService) {
    this.nfcTagService = nfcTagService;
  }

  // Create
  @PostMapping
  public ResponseEntity<NfcTagResponseDto> create(@Valid @RequestBody CreateNfcTagRequestDto createNfcTagRequestDto) {
    NfcTagResponseDto nfcTagResponseDto = nfcTagService.create(createNfcTagRequestDto);
    return ResponseEntity.ok(nfcTagResponseDto);
  }

  // Read all
  @GetMapping
  public ResponseEntity<Page<NfcTagResponseDto>> readAll(@PageableDefault(size = 10) Pageable pageable) {
    Page<NfcTagResponseDto> nfcTagResponseDtoPage = nfcTagService.readAll(pageable);
    return ResponseEntity.ok(nfcTagResponseDtoPage);
  }

  // Read
  @GetMapping("/{id}")
  public ResponseEntity<NfcTagResponseDto> read(Long id) {
    NfcTagResponseDto nfcTagResponseDto = nfcTagService.read(id);
    return ResponseEntity.ok(nfcTagResponseDto);
  }

  // Update
  @PutMapping("/{id}")
  public ResponseEntity<NfcTagResponseDto> update(@Valid @RequestBody UpdateNfcTagRequestDto updateNfcTagRequestDto, @PathVariable Long id) {
    NfcTagResponseDto nfcTagResponseDto = nfcTagService.update(updateNfcTagRequestDto, id);
    return ResponseEntity.ok(nfcTagResponseDto);
  }

  // Delete
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    nfcTagService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
