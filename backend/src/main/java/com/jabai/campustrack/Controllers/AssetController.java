package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateAssetRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateAssetRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
import com.jabai.campustrack.Services.AssetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
/**
 * <p>NOTE: DO NOT VIOLATE LAYERS STRUCTURE.</p>
 *
 * <p>CHRIS CHAN: Perform CRUD operations para sa Assets table</p>
 *
 * <p>Layer structure:</p>
 * <ul>
 *   <li>Controller layer -> DTO (with annotations)</li>
 *   <li>Service layer -> DTO</li>
 *   <li>Repository layer -> Model</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/assets")
public class AssetController {

  private final AssetService assetService;

  public AssetController(AssetService assetService) {
    this.assetService = assetService;
  }

  // CREATE
  @PostMapping
  public ResponseEntity<AssetResponseDto> createAsset(
          @Valid @RequestBody CreateAssetRequestDto request
  ) {
    AssetResponseDto createdAsset = assetService.createAsset(request);

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(createdAsset);
  }

  // READ ALL
  @GetMapping
  public ResponseEntity<List<AssetResponseDto>> getAllAssets() {

    List<AssetResponseDto> assets = assetService.getAllAssets();

    return ResponseEntity.ok(assets);
  }

  // READ ONE
  @GetMapping("/{id}")
  public ResponseEntity<AssetResponseDto> getAssetById(
          @PathVariable Long id
  ) {
    AssetResponseDto asset = assetService.getAssetById(id);

    return ResponseEntity.ok(asset);
  }

  // UPDATE
  @PutMapping("/{id}")
  public ResponseEntity<AssetResponseDto> updateAsset(
          @PathVariable Long id,
          @Valid @RequestBody UpdateAssetRequestDto request
  ) {
    AssetResponseDto updatedAsset =
            assetService.updateAsset(id, request);

    return ResponseEntity.ok(updatedAsset);
  }

  // DELETE
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteAsset(
          @PathVariable Long id
  ) {
    assetService.deleteAsset(id);

    return ResponseEntity.noContent().build();
  }
}
