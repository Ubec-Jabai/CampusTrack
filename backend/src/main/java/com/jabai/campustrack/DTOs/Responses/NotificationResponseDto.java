package com.jabai.campustrack.DTOs.Responses;

import com.jabai.campustrack.Models.Enums.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponseDto {
  private final Long id;
  private final LocalDateTime createdAt;
  private final Long userId;
  private final Long incidentId;
  private final NotificationType type;
  private final String message;
  private final LocalDateTime readAt;

  public NotificationResponseDto(
          Long id,
          LocalDateTime createdAt,
          Long userId,
          Long incidentId,
          NotificationType type,
          String message,
          LocalDateTime readAt
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.userId = userId;
    this.incidentId = incidentId;
    this.type = type;
    this.message = message;
    this.readAt = readAt;
  }

  // Getters
  public Long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public Long getUserId() { return userId; }
  public Long getIncidentId() { return incidentId; }
  public NotificationType getType() { return type; }
  public String getMessage() { return message; }
  public LocalDateTime getReadAt() { return readAt; }
}
