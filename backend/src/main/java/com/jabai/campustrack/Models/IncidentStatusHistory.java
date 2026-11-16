package com.jabai.campustrack.Models;

import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.Generated;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident_status_history")
public class IncidentStatusHistory {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "incident_id", nullable = false)
  private Incident incident;

  @Enumerated(EnumType.STRING)
  @Column(name = "from_status", length = 100)
  private IncidentStatus fromStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "to_status", nullable = false, length = 100)
  private IncidentStatus toStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "changed_by", nullable = false)
  private User changedBy;

  @Column(name = "changed_at", insertable = false, updatable = false)
  @Generated
  private LocalDateTime changedAt;

  protected IncidentStatusHistory() { }

  public IncidentStatusHistory(Incident incident, IncidentStatus fromStatus, IncidentStatus toStatus, User changedBy) {
    this.incident = incident;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.changedBy = changedBy;
  }

  // Getters
  public Long getId() { return id; }
  public Incident getIncident() { return incident; }
  public IncidentStatus getFromStatus() { return fromStatus; }
  public IncidentStatus getToStatus() { return toStatus; }
  public User getChangedBy() { return changedBy; }
  public LocalDateTime getChangedAt() { return changedAt; }

  // Setters
  public void setIncident(Incident incident) { this.incident = incident; }
  public void setFromStatus(IncidentStatus fromStatus) { this.fromStatus = fromStatus; }
  public void setToStatus(IncidentStatus toStatus) { this.toStatus = toStatus; }
  public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
}
