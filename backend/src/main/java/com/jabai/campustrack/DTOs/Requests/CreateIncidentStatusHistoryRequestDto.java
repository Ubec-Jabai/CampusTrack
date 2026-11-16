package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateIncidentStatusHistoryRequestDto {
  @NotNull(message = "Incident ID is required.")
  @Positive(message = "Incident ID must be a positive number.")
  private final Long incidentId;

  private final IncidentStatus fromStatus;

  @NotNull(message = "To status is required.")
  private final IncidentStatus toStatus;

  @NotNull(message = "Changed by user ID is required.")
  @Positive(message = "Changed by user ID must be a positive number.")
  private final Long changedById;

  public CreateIncidentStatusHistoryRequestDto(
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
