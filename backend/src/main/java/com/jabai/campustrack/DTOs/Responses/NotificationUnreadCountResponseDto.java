package com.jabai.campustrack.DTOs.Responses;

public class NotificationUnreadCountResponseDto {
  private final long unreadCount;

  public NotificationUnreadCountResponseDto(long unreadCount) {
    this.unreadCount = unreadCount;
  }

  public long getUnreadCount() { return unreadCount; }
}
