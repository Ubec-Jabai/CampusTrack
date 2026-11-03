package com.jabai.campustrack.DTOs.Responses;

public class HealthResponseDto {
  private final String message;

  public HealthResponseDto(String message) {
    this.message = message;
  }

  public String getMessage() { return message; }
}
