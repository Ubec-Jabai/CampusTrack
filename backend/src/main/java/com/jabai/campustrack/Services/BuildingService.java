package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateBuildingRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateBuildingRequestDto;
import com.jabai.campustrack.DTOs.Responses.BuildingResponseDto;
import com.jabai.campustrack.Models.Building;
import com.jabai.campustrack.Repositories.BuildingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;

    public BuildingService(BuildingRepository buildingRepository) {
        this.buildingRepository = buildingRepository;
    }

    // CREATE
    public BuildingResponseDto createBuilding(
            CreateBuildingRequestDto request
    ) {

        Building building = new Building(
                request.getName()
        );

        Building savedBuilding = buildingRepository.save(building);

        return toResponseDto(savedBuilding);
    }

    // READ ALL
    public List<BuildingResponseDto> getAllBuildings() {

        return buildingRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    // READ ONE
    public BuildingResponseDto getBuildingById(Long id) {

        Building building = buildingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Building not found.")
                );

        return toResponseDto(building);
    }

    // UPDATE
    public BuildingResponseDto updateBuilding(
            Long id,
            UpdateBuildingRequestDto request
    ) {

        Building building = buildingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Building not found.")
                );

        building.setName(request.getName());

        Building updatedBuilding =
                buildingRepository.save(building);

        return toResponseDto(updatedBuilding);
    }

    // DELETE
    public void deleteBuilding(Long id) {

        Building building = buildingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Building not found.")
                );

        buildingRepository.delete(building);
    }

    // MODEL → RESPONSE DTO
    private BuildingResponseDto toResponseDto(
            Building building
    ) {

        return new BuildingResponseDto(
                building.getId(),
                building.getName(),
                building.getCreatedAt()
        );
    }
}