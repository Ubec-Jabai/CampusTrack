package com.jabai.campustrack.Models;

import com.jabai.campustrack.Models.Enums.NotificationType;
import jakarta.persistence.*;
import org.hibernate.annotations.Generated;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "created_at", insertable = false, updatable = false)
  @Generated // Return the database-generated timestamp after an insert.
  private LocalDateTime createdAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "incident_id")
  private Incident incident;

  @Enumerated(EnumType.STRING)
  @Column(name = "notification_type", nullable = false, length = 50)
  private NotificationType type;

  @Column(name = "message", nullable = false, length = 1000)
  private String message;

  @Column(name = "read_at")
  private LocalDateTime readAt;

  protected Notification() { }

  public Notification(User user, Incident incident, NotificationType type, String message) {
    this.user = user;
    this.incident = incident;
    this.type = type;
    this.message = message;
  }

  public Long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public User getUser() { return user; }
  public Incident getIncident() { return incident; }
  public NotificationType getType() { return type; }
  public String getMessage() { return message; }
  public LocalDateTime getReadAt() { return readAt; }

  public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
