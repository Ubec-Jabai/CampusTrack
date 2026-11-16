package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.validation.constraints.Positive;

public class UpdateIncidentStatusHistoryRequestDto {
  @Positive(message = "Incident ID must be a positive number.")
  private final Long incidentId;

  private final IncidentStatus fromStatus;
  private final IncidentStatus toStatus;

  @Positive(message = "Changed by user ID must be a positive number.")
  private final Long changedById;

  public UpdateIncidentStatusHistoryRequestDto(
          Long incidentId,
          IncidentStatus fromStatus,
          IncidentStatus toStatus,
          Long changedById
  ) {
    this.incidentId = incidentId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.changedById = changedById;
  }

  // Getters
  public Long getIncidentId() { return incidentId; }
  public IncidentStatus getFromStatus() { return fromStatus; }
  public IncidentStatus getToStatus() { return toStatus; }
  public Long getChangedById() { return changedById; }
}
