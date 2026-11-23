package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.AssetCategory;
import com.jabai.campustrack.Models.Enums.AssetCondition;
import com.jabai.campustrack.Models.Enums.AssetCriticality;
import com.jabai.campustrack.Models.Enums.AssetStatus;
import jakarta.validation.constraints.Positive;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class SearchAssetRequestDto {
    @Positive
    private final Long id;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private final LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private final LocalDate to;

    @Positive
    private final Long roomId;

    private final String name;
    private final String brand;
    private final String model;
    private final String serialNumber;
    private final AssetCategory category;
    private final AssetStatus status;
    private final AssetCondition condition;
    private final AssetCriticality criticality;

    public SearchAssetRequestDto(
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
            LocalDate from,
            LocalDate to
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
        this.from = from;
        this.to = to;
    }

    // Getters
    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public String getSerialNumber() { return serialNumber; }
    public AssetCategory getCategory() { return category; }
    public AssetStatus getStatus() { return status; }
    public AssetCondition getCondition() { return condition; }
    public AssetCriticality getCriticality() { return criticality; }
    public LocalDate getFrom() { return from; }
    public LocalDate getTo() { return to; }
}