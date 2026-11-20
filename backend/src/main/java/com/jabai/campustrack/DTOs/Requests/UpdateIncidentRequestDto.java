package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateIncidentRequestDto {
  private final Long roomId;
  private final Long reportedById;
  private final Long assetId;
  private final Long assignedToId;
  private final IncidentCategory category;
  private final IncidentStatus status;

  @Size(max = 50, message = "Incident number must be 0 to 50 characters only.")
  private final String incidentNumber;

  private final String description;
  private final Boolean safetyHazard;
  private final Boolean operationalImpact;
  private final Integer affectedArea;
  private final LocalDateTime evaluatedAt;
  private final LocalDateTime resolvedAt;
  private final LocalDateTime closedAt;

  @Size(max = 500, message = "Rejection reason must be 0 to 500 characters only.")
  private final String rejectionReason;

  public UpdateIncidentRequestDto(
          Long roomId,
          Long reportedById,
          IncidentCategory category,
          String incidentNumber,
          IncidentStatus status,
          String description,
          Boolean safetyHazard,
          Boolean operationalImpact,
          Integer affectedArea,
          Long assetId,
          Long assignedToId,
          LocalDateTime evaluatedAt,
          LocalDateTime resolvedAt,
          LocalDateTime closedAt,
          String rejectionReason
  ) {
    this.roomId = roomId;
    this.reportedById = reportedById;
    this.category = category;
    this.incidentNumber = incidentNumber;
    this.status = status;
    this.description = description;
    this.safetyHazard = safetyHazard;
    this.operationalImpact = operationalImpact;
    this.affectedArea = affectedArea;
    this.assetId = assetId;
    this.assignedToId = assignedToId;
    this.evaluatedAt = evaluatedAt;
    this.resolvedAt = resolvedAt;
    this.closedAt = closedAt;
    this.rejectionReason = rejectionReason;
  }

  // Getters
  public Long getRoomId() { return roomId; }
  public Long getReportedById() { return reportedById; }
  public Long getAssetId() { return assetId; }
  public Long getAssignedToId() { return assignedToId; }
  public IncidentCategory getCategory() { return category; }
  public String getIncidentNumber() { return incidentNumber; }
  public IncidentStatus getStatus() { return status; }
  public String getDescription() { return description; }
  public Boolean getSafetyHazard() { return safetyHazard; }
  public Boolean getOperationalImpact() { return operationalImpact; }
  public Integer getAffectedArea() { return affectedArea; }
  public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
  public LocalDateTime getResolvedAt() { return resolvedAt; }
  public LocalDateTime getClosedAt() { return closedAt; }
  public String getRejectionReason() { return rejectionReason; }
}