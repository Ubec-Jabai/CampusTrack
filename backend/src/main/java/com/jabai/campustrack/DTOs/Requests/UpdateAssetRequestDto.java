package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.AssetCategory;
import com.jabai.campustrack.Models.AssetStatus;
import com.jabai.campustrack.Models.AssetCondition;
import com.jabai.campustrack.Models.AssetCriticality;

public record UpdateAssetRequestDto(
        Long roomId,
        String name,
        String brand,
        String model,
        String serialNumber,
        AssetCategory category,
        AssetStatus status,
        AssetCondition condition,
        AssetCriticality criticality
) {
}