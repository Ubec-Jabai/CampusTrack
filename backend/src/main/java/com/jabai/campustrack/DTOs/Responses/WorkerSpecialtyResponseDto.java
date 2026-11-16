package com.jabai.campustrack.DTOs.Responses;

import com.jabai.campustrack.Models.Enums.Specialty;

public class WorkerSpecialtyResponseDto {
  private final Long userId;
  private final Specialty specialty;

  public WorkerSpecialtyResponseDto(Long userId, Specialty specialty) {
    this.userId = userId;
    this.specialty = specialty;
  }

  // Getters
  public Long getUserId() { return userId; }
  public Specialty getSpecialty() { return specialty; }
}
