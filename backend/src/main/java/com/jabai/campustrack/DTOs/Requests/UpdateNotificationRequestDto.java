package com.jabai.campustrack.DTOs.Requests;

public class UpdateNotificationRequestDto {
  private final Boolean read;

  public UpdateNotificationRequestDto(Boolean read) {
    this.read = read;
  }

  public Boolean getRead() { return read; }
}
