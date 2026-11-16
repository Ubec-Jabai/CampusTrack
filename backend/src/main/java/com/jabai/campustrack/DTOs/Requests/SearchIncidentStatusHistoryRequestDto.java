package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.validation.constraints.Positive;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class SearchIncidentStatusHistoryRequestDto {
  @Positive
  private final Long incidentId;

  private final IncidentStatus fromStatus;
  private final IncidentStatus toStatus;

  @Positive
  private final Long changedById;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private final LocalDate changedFrom;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private final LocalDate changedTo;

  public SearchIncidentStatusHistoryRequestDto(
          Long incidentId,
          IncidentStatus fromStatus,
          IncidentStatus toStatus,
          Long changedById,
          LocalDate changedFrom,
          LocalDate changedTo
  ) {
    this.incidentId = incidentId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.changedById = changedById;
    this.changedFrom = changedFrom;
    this.changedTo = changedTo;
  }

  // Getters
  public Long getIncidentId() { return incidentId; }
  public IncidentStatus getFromStatus() { return fromStatus; }
  public IncidentStatus getToStatus() { return toStatus; }
  public Long getChangedById() { return changedById; }
  public LocalDate getChangedFrom() { return changedFrom; }
  public LocalDate getChangedTo() { return changedTo; }
}
