package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateAssetRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchAssetRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateAssetRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
import com.jabai.campustrack.DTOs.Responses.RoomResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Enums.AssetCategory;
import com.jabai.campustrack.Models.Enums.AssetCondition;
import com.jabai.campustrack.Models.Enums.AssetCriticality;
import com.jabai.campustrack.Models.Enums.AssetStatus;
import com.jabai.campustrack.Models.Enums.Specialty;
import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.RoomRepository;
import com.jabai.campustrack.Repositories.Specifications.AssetSpecifications;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@Transactional
public class AssetService {
    private final AssetRepository assetRepository;
    private final RoomRepository roomRepository;

    public AssetService(AssetRepository assetRepository, RoomRepository roomRepository) {
        this.assetRepository = assetRepository;
        this.roomRepository = roomRepository;
    }

    // Create
    public AssetResponseDto createAsset(CreateAssetRequestDto request) {
        Long roomId = request.getRoomId();
        String name = request.getName();
        String brand = request.getBrand();
        String model = request.getModel();
        String serialNumber = request.getSerialNumber();
        AssetCategory category = request.getCategory();
        AssetStatus status = request.getStatus();
        AssetCondition condition = request.getCondition();
        AssetCriticality criticality = request.getCriticality();
        Specialty specialty = request.getSpecialty();

        Room foundRoom = roomRepository
                .findById(roomId)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find room with an ID of %d.", request.getRoomId())));

        if (specialty == null)
            specialty = specialtyFor(category);

        Asset asset = new Asset(foundRoom, name, brand, model, serialNumber, category, status, condition, criticality, specialty);

        Asset savedAsset = assetRepository.save(asset);

        return buildAssetResponseDto(savedAsset);
    }

    // Read all
    public Page<AssetResponseDto> getAllAssets(Pageable pageable) {
        return assetRepository
                .findAll(pageable)
                .map(this::buildAssetResponseDto);
    }

    // Search
    public Page<AssetResponseDto> searchAssets(SearchAssetRequestDto request, Pageable pageable) {
        LocalDate fromDate = request.getFrom();
        LocalDate toDate = request.getTo();
        Long roomId = request.getRoomId();
        String name = request.getName();
        String brand = request.getBrand();
        String model = request.getModel();
        String serialNumber = request.getSerialNumber();
        AssetCategory category = request.getCategory();
        AssetStatus status = request.getStatus();
        AssetCondition condition = request.getCondition();
        AssetCriticality criticality = request.getCriticality();

        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasRoomId(roomId))
                .and(AssetSpecifications.hasNameKeyword(name))
                .and(AssetSpecifications.hasBrandKeyword(brand))
                .and(AssetSpecifications.hasModelKeyword(model))
                .and(AssetSpecifications.hasSerialNumber(serialNumber))
                .and(AssetSpecifications.hasCategory(category))
                .and(AssetSpecifications.hasStatus(status))
                .and(AssetSpecifications.hasCondition(condition))
                .and(AssetSpecifications.hasCriticality(criticality))
                .and(AssetSpecifications.createdBetween(from, to));

        return assetRepository
                .findAll(spec, pageable)
                .map(this::buildAssetResponseDto);
    }

    // Read
    public AssetResponseDto getAssetById(Long id) {
        Asset asset = assetRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find asset with an ID of %d.", id)));

        return buildAssetResponseDto(asset);
    }

    // Update
    public AssetResponseDto updateAsset(Long id, UpdateAssetRequestDto request) {
        Long roomId = request.getRoomId();
        String name = request.getName();
        String brand = request.getBrand();
        String model = request.getModel();
        String serialNumber = request.getSerialNumber();
        AssetCategory category = request.getCategory();
        AssetStatus status = request.getStatus();
        AssetCondition condition = request.getCondition();
        AssetCriticality criticality = request.getCriticality();
        Specialty specialty = request.getSpecialty();

        Asset asset = assetRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find asset with an ID of %d.", id)));

        if (roomId != null) {
            Room room = roomRepository
                    .findById(roomId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find room with an ID of %d.", id)));
            asset.setRoom(room);
        }

        if (name != null)
            asset.setName(name);

        if (brand != null)
            asset.setBrand(brand);

        if (model != null)
            asset.setModel(model);

        if (serialNumber != null)
            asset.setSerialNumber(serialNumber);

        if (category != null)
            asset.setCategory(category);

        if (status != null)
            asset.setStatus(status);

        if (condition != null)
            asset.setCondition(condition);

        if (criticality != null)
            asset.setCriticality(criticality);

        if (specialty != null)
            asset.setSpecialty(specialty);

        Asset updatedAsset = assetRepository.save(asset);

        return buildAssetResponseDto(updatedAsset);
    }

    // Delete
    public void deleteAsset(Long id) {
        Asset asset = assetRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find asset with an ID of %d.", id)));

        assetRepository.delete(asset);
    }

    // ===== Service Utils =====
    private AssetResponseDto buildAssetResponseDto(Asset asset) {
        RoomResponseDto roomResponseDto = new RoomResponseDto(
                asset.getRoom().getId(),
                asset.getRoom().getCreatedAt(),
                asset.getRoom().getBuilding().getId(),
                asset.getRoom().getRoomNumber(),
                asset.getRoom().getCapacity(),
                asset.getRoom().getRoomType(),
                asset.getRoom().getCriticality()
        );

        return new AssetResponseDto(
                asset.getId(),
                roomResponseDto,
                asset.getName(),
                asset.getBrand(),
                asset.getModel(),
                asset.getSerialNumber(),
                asset.getCategory(),
                asset.getStatus(),
                asset.getCondition(),
                asset.getCriticality(),
                asset.getCreatedAt(),
                asset.getSpecialty()
        );
    }

    private Specialty specialtyFor(AssetCategory category) {
        return switch (category) {
            case COMPUTER, NETWORK_EQUIPMENT -> Specialty.NETWORK_IT;
            case PROJECTOR, LAB_EQUIPMENT, OFFICE_EQUIPMENT -> Specialty.EQUIPMENT;
            case AIRCONDITIONER -> Specialty.HVAC;
            case FURNITURE -> Specialty.FURNITURE;
            case ELECTRICAL_EQUIPMENT -> Specialty.ELECTRICAL;
            case OTHER -> Specialty.GENERAL;
        };
    }
}