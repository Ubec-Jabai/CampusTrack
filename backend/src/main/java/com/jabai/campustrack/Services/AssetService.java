package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateAssetRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateAssetRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.RoomRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final RoomRepository roomRepository;

    public AssetService(
            AssetRepository assetRepository,
            RoomRepository roomRepository) {
        this.assetRepository = assetRepository;
        this.roomRepository = roomRepository;
    }

    // CREATE
    public AssetResponseDto createAsset(CreateAssetRequestDto request) {

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Room not found"
                ));

        Asset asset = new Asset(
                room,
                request.name(),
                request.brand(),
                request.model(),
                request.serialNumber(),
                request.category(),
                request.status(),
                request.condition(),
                request.criticality()
        );

        Asset savedAsset = assetRepository.save(asset);

        return toDto(savedAsset);
    }

    // READ ALL
    @Transactional(readOnly = true)
    public List<AssetResponseDto> getAllAssets() {

        return assetRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // READ SINGLE
    @Transactional(readOnly = true)
    public AssetResponseDto getAssetById(Long id) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Asset not found"
                ));

        return toDto(asset);
    }

    // UPDATE
    public AssetResponseDto updateAsset(
            Long id,
            UpdateAssetRequestDto request) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Asset not found"
                ));

        // Update room only if provided
        if (request.roomId() != null) {
            Room room = roomRepository.findById(request.roomId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Room not found"
                    ));

            asset.setRoom(room);
        }

        // Update name only if provided
        if (request.name() != null) {
            asset.setName(request.name());
        }

        // Update brand only if provided
        if (request.brand() != null) {
            asset.setBrand(request.brand());
        }

        // Update model only if provided
        if (request.model() != null) {
            asset.setModel(request.model());
        }

        // Update serial number only if provided
        if (request.serialNumber() != null) {
            asset.setSerialNumber(request.serialNumber());
        }

        // Update category only if provided
        if (request.category() != null) {
            asset.setCategory(request.category());
        }

        // Update status only if provided
        if (request.status() != null) {
            asset.setStatus(request.status());
        }

        // Update condition only if provided
        if (request.condition() != null) {
            asset.setCondition(request.condition());
        }

        // Update criticality only if provided
        if (request.criticality() != null) {
            asset.setCriticality(request.criticality());
        }

        Asset updatedAsset = assetRepository.save(asset);

        return toDto(updatedAsset);
    }

    // DELETE
    public void deleteAsset(Long id) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Asset not found"
                ));

        assetRepository.delete(asset);
    }

    // CONVERT ENTITY TO RESPONSE DTO
    private AssetResponseDto toDto(Asset asset) {

        return new AssetResponseDto(
                asset.getId(),
                asset.getRoom() != null ? asset.getRoom().getId() : null,
                asset.getName(),
                asset.getBrand(),
                asset.getModel(),
                asset.getSerialNumber(),
                asset.getCategory(),
                asset.getStatus(),
                asset.getCondition(),
                asset.getCriticality(),
                asset.getCreatedAt()
        );
    }
}