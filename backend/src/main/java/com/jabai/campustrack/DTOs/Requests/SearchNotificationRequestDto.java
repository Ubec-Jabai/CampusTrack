package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.NotificationType;

public class SearchNotificationRequestDto {
  private final NotificationType type;
  private final Boolean read;

  public SearchNotificationRequestDto(NotificationType type, Boolean read) {
    this.type = type;
    this.read = read;
  }

  // Getters
  public NotificationType getType() { return type; }
  public Boolean getRead() { return read; }
}
