package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.UserRole;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateUserRequestDto {
  private UserRole userRole;

  @Size(min = 8, message = "Password must be at least 8 characters.")
  private String password;

  private Boolean available;

  private LocalDateTime lastAssignedAt;

  public UpdateUserRequestDto() {}

  public UserRole getUserRole() { return userRole; }
  public void setUserRole(UserRole userRole) { this.userRole = userRole; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public Boolean getAvailable() { return available; }
  public void setAvailable(Boolean available) { this.available = available; }

  public LocalDateTime getLastAssignedAt() { return lastAssignedAt; }
  public void setLastAssignedAt(LocalDateTime lastAssignedAt) { this.lastAssignedAt = lastAssignedAt; }
}
