package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.Specialty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateWorkerSpecialtyRequestDto {
  @NotNull(message = "User ID is required.")
  @Positive(message = "User ID must be a positive number.")
  private final Long userId;

  @NotNull(message = "Specialty is required.")
  private final Specialty specialty;

  public CreateWorkerSpecialtyRequestDto(Long userId, Specialty specialty) {
    this.userId = userId;
    this.specialty = specialty;
  }

  // Getters
  public Long getUserId() { return userId; }
  public Specialty getSpecialty() { return specialty; }
}
