package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.IncidentCategory;
import jakarta.validation.constraints.*;

// Omitted fields stay unchanged, matching the project's other update DTOs.
public record UpdateIncidentRequestDto(
    @Positive Long roomId,
    @Positive Long assetId,
    IncidentCategory category,
    @Pattern(regexp = "(?s).*\\S.*", message = "Description must not be blank.") @Size(max = 16000) String description,
    Boolean safetyHazard,
    Boolean operationalImpact,
    @Positive Integer affectedArea
) { }
