package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateBuildingRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateBuildingRequestDto;
import com.jabai.campustrack.DTOs.Responses.BuildingResponseDto;
import com.jabai.campustrack.Services.BuildingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


/**
 * <h4>NOTE: DO NOT VIOLATE LAYERS STRUCTURE.</h4>
 * <br/>
 * <p>ART TECSON: Pag add ug paginatiom sa imohang read all gamit ang spring data extension</p>
 */
@RestController
@RequestMapping("/api/buildings")
public class BuildingController {
    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    // Create
    @PostMapping
    public ResponseEntity<BuildingResponseDto> createBuilding(@Valid @RequestBody CreateBuildingRequestDto request) {
        BuildingResponseDto createdBuilding = buildingService.createBuilding(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBuilding);
    }

    // Read all
    @GetMapping
    public ResponseEntity<Page<BuildingResponseDto>> getAllBuildings(
            Pageable pageable
    ) {
        Page<BuildingResponseDto> buildings =
                buildingService.getAllBuildings(pageable);

        return ResponseEntity.ok(buildings);
    }

    // Read
    @GetMapping("/{id}")
    public ResponseEntity<BuildingResponseDto> getBuildingById(@PathVariable Long id) {
        BuildingResponseDto building = buildingService.getBuildingById(id);
        return ResponseEntity.ok(building);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponseDto> updateBuilding(@PathVariable Long id, @Valid @RequestBody UpdateBuildingRequestDto request) {
        BuildingResponseDto updatedBuilding = buildingService.updateBuilding(id, request);
        return ResponseEntity.ok(updatedBuilding);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Long id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build();
    }
}