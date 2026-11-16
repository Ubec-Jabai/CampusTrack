package com.jabai.campustrack.Models;

import com.jabai.campustrack.Models.Enums.Specialty;
import jakarta.persistence.*;

@Entity
@Table(name = "worker_specialties")
@IdClass(WorkerSpecialtyId.class)
public class WorkerSpecialty {
  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Id
  @Enumerated(EnumType.STRING)
  @Column(name = "specialty", nullable = false, length = 50)
  private Specialty specialty;

  protected WorkerSpecialty() { }

  public WorkerSpecialty(User user, Specialty specialty) {
    this.user = user;
    this.specialty = specialty;
  }

  // Getters
  public User getUser() { return user; }
  public Specialty getSpecialty() { return specialty; }
}
