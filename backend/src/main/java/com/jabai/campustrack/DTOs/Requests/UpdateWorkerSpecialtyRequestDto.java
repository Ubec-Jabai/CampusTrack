package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.Specialty;
import jakarta.validation.constraints.NotNull;

public class UpdateWorkerSpecialtyRequestDto {
  @NotNull(message = "Specialty is required.")
  private final Specialty specialty;

  public UpdateWorkerSpecialtyRequestDto(Specialty specialty) {
    this.specialty = specialty;
  }

  // Getters
  public Specialty getSpecialty() { return specialty; }
}
