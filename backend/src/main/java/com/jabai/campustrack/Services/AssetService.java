package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateAssetRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateAssetRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final RoomRepository roomRepository;

    public AssetService(
            AssetRepository assetRepository,
            RoomRepository roomRepository
    ) {
        this.assetRepository = assetRepository;
        this.roomRepository = roomRepository;
    }

    // CREATE
    public AssetResponseDto createAsset(CreateAssetRequestDto request) {

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found."));

        Asset asset = new Asset(
                room,
                request.getName(),
                request.getBrand(),
                request.getModel(),
                request.getSerialNumber(),
                request.getCategory(),
                request.getStatus(),
                request.getCondition(),
                request.getCriticality()
        );

        Asset savedAsset = assetRepository.save(asset);

        return toResponseDto(savedAsset);
    }

    // READ ALL
    public List<AssetResponseDto> getAllAssets() {

        return assetRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    // READ ONE
    public AssetResponseDto getAssetById(Long id) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found."));

        return toResponseDto(asset);
    }

    // UPDATE
    public AssetResponseDto updateAsset(
            Long id,
            UpdateAssetRequestDto request
    ) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found."));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found."));

        asset.setRoom(room);
        asset.setName(request.getName());
        asset.setBrand(request.getBrand());
        asset.setModel(request.getModel());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setCategory(request.getCategory());
        asset.setStatus(request.getStatus());
        asset.setCondition(request.getCondition());
        asset.setCriticality(request.getCriticality());

        Asset updatedAsset = assetRepository.save(asset);

        return toResponseDto(updatedAsset);
    }

    // DELETE
    public void deleteAsset(Long id) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found."));

        assetRepository.delete(asset);
    }

    // MODEL → RESPONSE DTO
    private AssetResponseDto toResponseDto(Asset asset) {

        return new AssetResponseDto(
                asset.getId(),
                asset.getRoom().getId(),
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