package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.AssetCategory;
import com.jabai.campustrack.Models.Enums.AssetCondition;
import com.jabai.campustrack.Models.Enums.AssetCriticality;
import com.jabai.campustrack.Models.Enums.AssetStatus;
import com.jabai.campustrack.Models.Enums.Specialty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CreateAssetRequestDto {

    @NotNull(message = "Room ID is required.")
    @Positive(message = "Room ID must be a positive number.")
    private final Long roomId;

    @NotBlank(message = "Asset name is required.")
    @Size(max = 100, message = "Name must be 0 to 100 characters only.")
    private final String name;

    @Size(max = 100, message = "Brand must be 0 to 100 characters only.")
    private final String brand;

    @Size(max = 100, message = "Model must be 0 to 100 characters only.")
    private final String model;

    @Size(max = 100, message = "Serial number must be 0 to 100 characters only.")
    private final String serialNumber;

    @NotNull(message = "Asset category is required.")
    private final AssetCategory category;

    @NotNull(message = "Asset status is required.")
    private final AssetStatus status;

    @NotNull(message = "Asset condition is required.")
    private final AssetCondition condition;

    @NotNull(message = "Asset criticality is required.")
    private final AssetCriticality criticality;

    private final Specialty specialty;

    public CreateAssetRequestDto(
            Long roomId,
            String name,
            String brand,
            String model,
            String serialNumber,
            AssetCategory category,
            AssetStatus status,
            AssetCondition condition,
            AssetCriticality criticality,
            Specialty specialty
    ) {
        this.roomId = roomId;
        this.name = name;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.category = category;
        this.status = status;
        this.condition = condition;
        this.criticality = criticality;
        this.specialty = specialty;
    }

    public Long getRoomId() { return roomId; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public String getSerialNumber() { return serialNumber; }
    public AssetCategory getCategory() { return category; }
    public AssetStatus getStatus() { return status; }
    public AssetCondition getCondition() { return condition; }
    public AssetCriticality getCriticality() { return criticality; }
    public Specialty getSpecialty() { return specialty; }
}