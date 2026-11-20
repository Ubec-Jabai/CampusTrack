package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class CreateIncidentRequestDto {
    @NotNull(message = "Room ID is required.")
    private final Long roomId;

    @NotNull(message = "Reporter ID is required.")
    private final Long reportedById;

    @NotNull(message = "Category is required.")
    private final IncidentCategory category;

    @NotNull(message = "Incident status is required.")
    private final IncidentStatus status;

    @NotBlank(message = "Incident number is required.")
    @Size(max = 50, message = "Incident number must be 0 to 50 characters.")
    private final String incidentNumber;

    @NotBlank(message = "Description is required.")
    private final String description;

    @NotNull(message = "Safety hazard is required.")
    private final Boolean safetyHazard;

    @NotNull(message = "Operational impact is required.")
    private final Boolean operationalImpact;

    @NotNull(message = "Affected area is required.")
    private final Integer affectedArea;

    private final Long assetId;
    private final Long assignedToId;
    private final LocalDateTime evaluatedAt;
    private final LocalDateTime resolvedAt;
    private final LocalDateTime closedAt;

    public CreateIncidentRequestDto(
            Long roomId,
            Long reportedById,
            IncidentCategory category,
            IncidentStatus status,
            String incidentNumber,
            String description,
            Boolean safetyHazard,
            Boolean operationalImpact,
            Long assetId,
            Long assignedToId,
            Integer affectedArea,
            LocalDateTime evaluatedAt,
            LocalDateTime resolvedAt,
            LocalDateTime closedAt
    ) {
        this.roomId = roomId;
        this.reportedById = reportedById;
        this.category = category;
        this.status = status;
        this.incidentNumber = incidentNumber;
        this.description = description;
        this.safetyHazard = safetyHazard;
        this.operationalImpact = operationalImpact;
        this.assetId = assetId;
        this.assignedToId = assignedToId;
        this.affectedArea = affectedArea;
        this.evaluatedAt = evaluatedAt;
        this.resolvedAt = resolvedAt;
        this.closedAt = closedAt;
    }

    // Getters
    public Long getRoomId() { return roomId; }
    public Long getReportedById() { return reportedById; }
    public IncidentCategory getCategory() { return category; }
    public String getDescription() { return description; }
    public Boolean getSafetyHazard() { return safetyHazard; }
    public Boolean getOperationalImpact() { return operationalImpact; }
    public Long getAssetId() { return assetId; }
    public Long getAssignedToId() { return assignedToId; }
    public Integer getAffectedArea() { return affectedArea; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public String getIncidentNumber() { return incidentNumber; }
    public IncidentStatus getStatus() { return status; }
}
