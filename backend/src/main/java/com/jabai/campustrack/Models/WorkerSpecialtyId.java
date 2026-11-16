package com.jabai.campustrack.Models;

import com.jabai.campustrack.Models.Enums.Specialty;

import java.io.Serializable;
import java.util.Objects;

public class WorkerSpecialtyId implements Serializable {
  private Long user;
  private Specialty specialty;

  public WorkerSpecialtyId() { }

  public WorkerSpecialtyId(Long user, Specialty specialty) {
    this.user = user;
    this.specialty = specialty;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other)
      return true;
    if (!(other instanceof WorkerSpecialtyId that))
      return false;
    return Objects.equals(user, that.user) && specialty == that.specialty;
  }

  @Override
  public int hashCode() {
    return Objects.hash(user, specialty);
  }
}
