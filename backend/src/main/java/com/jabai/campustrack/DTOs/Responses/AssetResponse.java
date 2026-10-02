package com.jabai.campustrack.DTOs.Responses;

import com.jabai.campustrack.Models.Enums.AssetCategory;
import com.jabai.campustrack.Models.Enums.AssetCondition;
import com.jabai.campustrack.Models.Enums.AssetCriticality;
import com.jabai.campustrack.Models.Enums.AssetStatus;

import java.time.LocalDateTime;

public class AssetResponseDto {

    private final Long id;
    private final Long roomId;
    private final String name;
    private final String brand;
    private final String model;
    private final String serialNumber;
    private final AssetCategory category;
    private final AssetStatus status;
    private final AssetCondition condition;
    private final AssetCriticality criticality;
    private final LocalDateTime createdAt;

    public AssetResponseDto(
            Long id,
            Long roomId,
            String name,
            String brand,
            String model,
            String serialNumber,
            AssetCategory category,
            AssetStatus status,
            AssetCondition condition,
            AssetCriticality criticality,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.roomId = roomId;
        this.name = name;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.category = category;
        this.status = status;
        this.condition = condition;
        this.criticality = criticality;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getModel() {
        return model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public AssetCategory getCategory() {
        return category;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public AssetCondition getCondition() {
        return condition;
    }

    public AssetCriticality getCriticality() {
        return criticality;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}