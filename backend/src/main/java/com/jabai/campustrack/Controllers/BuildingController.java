package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateBuildingRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateBuildingRequestDto;
import com.jabai.campustrack.DTOs.Responses.BuildingResponseDto;
import com.jabai.campustrack.Services.BuildingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>NOTE: DO NOT VIOLATE LAYERS STRUCTURE.</p>
 *
 * <p>ART TECSON: Perform CRUD operations para sa Buildings table</p>
 *
 * <p>Layer structure:</p>
 * <ul>
 *   <li>Controller layer -> DTO (with annotations)</li>
 *   <li>Service layer -> DTO</li>
 *   <li>Repository layer -> Model</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<BuildingResponseDto> createBuilding(
            @Valid @RequestBody CreateBuildingRequestDto request
    ) {
        BuildingResponseDto createdBuilding =
                buildingService.createBuilding(request);

        return ResponseEntity
                .status(HttpStatus.CREATED )
                .body(createdBuilding);
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<BuildingResponseDto>> getAllBuildings() {

        List<BuildingResponseDto> buildings =
                buildingService.getAllBuildings();

        return ResponseEntity.ok(buildings);
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<BuildingResponseDto> getBuildingById(
            @PathVariable Long id
    ) {
        BuildingResponseDto building =
                buildingService.getBuildingById(id);

        return ResponseEntity.ok(building);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponseDto> updateBuilding(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBuildingRequestDto request
    ) {
        BuildingResponseDto updatedBuilding =
                buildingService.updateBuilding(id, request);

        return ResponseEntity.ok(updatedBuilding);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(
            @PathVariable Long id
    ) {
        buildingService.deleteBuilding(id);

        return ResponseEntity.noContent().build();
    }
}