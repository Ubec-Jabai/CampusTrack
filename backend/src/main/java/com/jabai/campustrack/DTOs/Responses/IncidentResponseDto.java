package com.jabai.campustrack.DTOs.Responses;

import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Enums.IncidentPriority;
import com.jabai.campustrack.Models.Enums.IncidentStatus;

import java.time.LocalDateTime;

public class IncidentResponseDto {
  private AssetResponseDto asset;
  private UserProfileResponseDto assigned;
  private Long assetId;
  private Long assignedToId;
  private LocalDateTime assignedAt;

  private final RoomResponseDto room;
  private final UserProfileResponseDto reportedBy;
  private final Long roomId;
  private final Long reportedById;

  private final Long id;
  private final LocalDateTime createdAt;
  private final LocalDateTime evaluatedAt;
  private final LocalDateTime resolvedAt;
  private final LocalDateTime closedAt;
  private final String incidentNumber;
  private final String description;
  private String photoPath;
  private final Boolean safetyHazard;
  private final Boolean operationalImpact;
  private final Integer affectedArea;
  private final IncidentCategory category;
  private final IncidentPriority priority;
  private final IncidentStatus status;

  private UserProfileResponseDto inspectedBy;
  private LocalDateTime inspectedAt;
  private LocalDateTime approvedAt;
  private String rejectionReason;

  public IncidentResponseDto(
          Long id,
          LocalDateTime createdAt,
          LocalDateTime evaluatedAt,
          LocalDateTime resolvedAt,
          LocalDateTime closedAt,

          Long roomId,
          Long reportedById,

          String incidentNumber,
          String description,
          Boolean safetyHazard,
          Boolean operationalImpact,
          Integer affectedArea,
          IncidentCategory category,
          IncidentPriority priority,
          IncidentStatus status
  ) {
    this.room = null;
    this.reportedBy = null;

    this.id = id;
    this.createdAt = createdAt;
    this.evaluatedAt = evaluatedAt;
    this.resolvedAt = resolvedAt;
    this.closedAt = closedAt;
    this.roomId = roomId;
    this.reportedById = reportedById;
    this.incidentNumber = incidentNumber;
    this.description = description;
    this.safetyHazard = safetyHazard;
    this.operationalImpact = operationalImpact;
    this.affectedArea = affectedArea;
    this.category = category;
    this.priority = priority;
    this.status = status;
  }

  public IncidentResponseDto(
          Long id,
          LocalDateTime createdAt,
          LocalDateTime evaluatedAt,
          LocalDateTime resolvedAt,
          LocalDateTime closedAt,

          RoomResponseDto room,
          UserProfileResponseDto reportedBy,

          String incidentNumber,
          String description,
          Boolean safetyHazard,
          Boolean operationalImpact,
          Integer affectedArea,
          IncidentCategory category,
          IncidentPriority priority,
          IncidentStatus status
  ) {
    this.roomId = null;
    this.reportedById = null;

    this.id = id;
    this.createdAt = createdAt;
    this.evaluatedAt = evaluatedAt;
    this.resolvedAt = resolvedAt;
    this.closedAt = closedAt;
    this.room = room;
    this.reportedBy = reportedBy;
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
  public AssetResponseDto getAsset() { return asset; }
  public RoomResponseDto getRoom() { return room; }
  public UserProfileResponseDto getReportedBy() { return reportedBy; }
  public UserProfileResponseDto getAssigned() { return assigned; }
  public Long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
  public LocalDateTime getResolvedAt() { return resolvedAt; }
  public LocalDateTime getClosedAt() { return closedAt; }
  public String getIncidentNumber() { return incidentNumber; }
  public String getDescription() { return description; }
  public String getPhotoPath() { return photoPath; }
  public Boolean getSafetyHazard() { return safetyHazard; }
  public Boolean getOperationalImpact() { return operationalImpact; }
  public Integer getAffectedArea() { return affectedArea; }
  public IncidentCategory getCategory() { return category; }
  public IncidentStatus getStatus() { return status; }
  public IncidentPriority getPriority() { return priority; }
  public Long getAssetId() { return assetId; }
  public Long getAssignedToId() { return assignedToId; }
  public LocalDateTime getAssignedAt() { return assignedAt; }
  public UserProfileResponseDto getInspectedBy() { return inspectedBy; }
  public LocalDateTime getInspectedAt() { return inspectedAt; }
  public LocalDateTime getApprovedAt() { return approvedAt; }
  public String getRejectionReason() { return rejectionReason; }

  // Setters
  public void setAsset(AssetResponseDto assetResponseDto) { this.asset = assetResponseDto; }
  public void setAssigned(UserProfileResponseDto userProfileResponseDto) { this.assigned = userProfileResponseDto; }
  public void setAssetId(Long assetId) { this.assetId = assetId; }
  public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
  public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
  public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }
  public void setInspectedBy(UserProfileResponseDto inspectedBy) { this.inspectedBy = inspectedBy; }
  public void setInspectedAt(LocalDateTime inspectedAt) { this.inspectedAt = inspectedAt; }
  public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
  public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
