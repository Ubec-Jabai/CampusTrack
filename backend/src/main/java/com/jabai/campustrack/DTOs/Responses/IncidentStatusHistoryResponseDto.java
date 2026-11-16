package com.jabai.campustrack.DTOs.Responses;

import com.jabai.campustrack.Models.Enums.IncidentStatus;

import java.time.LocalDateTime;

public class IncidentStatusHistoryResponseDto {
  private final Long id;
  private final Long incidentId;
  private final IncidentStatus fromStatus;
  private final IncidentStatus toStatus;
  private final UserProfileResponseDto changedBy;
  private final LocalDateTime changedAt;

  public IncidentStatusHistoryResponseDto(
          Long id,
          Long incidentId,
          IncidentStatus fromStatus,
          IncidentStatus toStatus,
          UserProfileResponseDto changedBy,
          LocalDateTime changedAt
  ) {
    this.id = id;
    this.incidentId = incidentId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.changedBy = changedBy;
    this.changedAt = changedAt;
  }

  // Getters
  public Long getId() { return id; }
  public Long getIncidentId() { return incidentId; }
  public IncidentStatus getFromStatus() { return fromStatus; }
  public IncidentStatus getToStatus() { return toStatus; }
  public UserProfileResponseDto getChangedBy() { return changedBy; }
  public LocalDateTime getChangedAt() { return changedAt; }
}
