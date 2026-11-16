package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.Specialty;
import jakarta.validation.constraints.Positive;

public class SearchWorkerSpecialtyRequestDto {
  @Positive(message = "User ID must be a positive number.")
  private final Long userId;

  private final Specialty specialty;

  public SearchWorkerSpecialtyRequestDto(Long userId, Specialty specialty) {
    this.userId = userId;
    this.specialty = specialty;
  }

  // Getters
  public Long getUserId() { return userId; }
  public Specialty getSpecialty() { return specialty; }
}
