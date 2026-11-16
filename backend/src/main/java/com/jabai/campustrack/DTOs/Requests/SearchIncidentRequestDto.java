package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Enums.IncidentPriority;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.validation.constraints.Positive;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class SearchIncidentRequestDto {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private final LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private final LocalDate to;

    @Positive
    private final Long assetId;

    @Positive
    private final Long roomId;

    @Positive
    private final Long reportedById;

    @Positive
    private final Long assignedToId;

    private final String incidentNumber;
    private final String description;
    private final Boolean safetyHazard;
    private final Boolean operationalImpact;

    @Positive
    private final Integer affectedArea;

    private final IncidentCategory category;
    private final IncidentPriority priority;
    private final IncidentStatus status;

    public SearchIncidentRequestDto(
            LocalDate from,
            LocalDate to,
            Long assetId,
            Long roomId,
            Long reportedById,
            Long assignedToId,
            String incidentNumber,
            String description,
            Boolean safetyHazard,
            Boolean operationalImpact,
            Integer affectedArea,
            IncidentCategory category,
            IncidentPriority priority,
            IncidentStatus status
    ) {
        this.from = from;
        this.to = to;
        this.assetId = assetId;
        this.roomId = roomId;
        this.reportedById = reportedById;
        this.assignedToId = assignedToId;
        this.incidentNumber = incidentNumber;
        this.description = description;
        this.safetyHazard = safetyHazard;
        this.operationalImpact = operationalImpact;
        this.affectedArea = affectedArea;
        this.category = category;
        this.priority = priority;
        this.status = status;
    }

    // Getters
    public LocalDate getFrom() { return from; }
    public LocalDate getTo() { return to; }
    public Long getAssetId() { return assetId; }
    public Long getRoomId() { return roomId; }
    public Long getReportedById() { return reportedById; }
    public Long getAssignedToId() { return assignedToId; }
    public String getIncidentNumber() { return incidentNumber; }
    public String getDescription() { return description; }
    public Boolean getSafetyHazard() { return safetyHazard; }
    public Boolean getOperationalImpact() { return operationalImpact; }
    public Integer getAffectedArea() { return affectedArea; }
    public IncidentCategory getCategory() { return category; }
    public IncidentPriority getPriority() { return priority; }
    public IncidentStatus getStatus() { return status; }
}
