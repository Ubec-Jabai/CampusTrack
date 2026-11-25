package com.jabai.campustrack.Models;

import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Enums.IncidentPriority;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.Generated;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
public class Incident {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "created_at", insertable = false, updatable = false)
  @Generated // Return the database-generated timestamp after an insert.
  private LocalDateTime createdAt;

  // Core columns
  @Column(name = "evaluated_at")
  private LocalDateTime evaluatedAt;

  @Column(name = "resolved_at")
  private LocalDateTime resolvedAt;

  @Column(name = "closed_at")
  private LocalDateTime closedAt;

  @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<MaintenanceRecord> maintenanceRecords = new ArrayList<>();

  // Asset
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "asset_id")
  private Asset asset;

  // Room
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "room_id", nullable = false)
  private Room room;

  // Reported by
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reported_by", nullable = false)
  private User reportedBy;

  // Assigned to
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_to")
  private User assignedTo;

  @Column(name = "incident_number", nullable = false, unique = true, length = 50)
  private String incidentNumber;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Column(name = "safety_hazard", nullable = false)
  private boolean safetyHazard;

  @Column(name = "operational_impact", nullable = false)
  private boolean operationalImpact;

  @Column(name = "affected_area", nullable = false)
  private Integer affectedArea;

  @Enumerated(EnumType.STRING)
  @Column(name = "category")
  private IncidentCategory category;

  @Enumerated(EnumType.STRING)
  @Column(name = "priority")
  private IncidentPriority priority;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private IncidentStatus status;

  // Inspection
  @Column(name = "photo_path", length = 500)
  private String photoPath;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inspected_by")
  private User inspectedBy;

  @Column(name = "inspected_at")
  private LocalDateTime inspectedAt;

  @Column(name = "asset_functional")
  private Boolean assetFunctional;

  // Review and assignment
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reviewed_by")
  private User reviewedBy;

  @Column(name = "reviewed_at")
  private LocalDateTime reviewedAt;

  @Column(name = "approved_at")
  private LocalDateTime approvedAt;

  @Column(name = "assigned_at")
  private LocalDateTime assignedAt;

  @Column(name = "rejection_reason", length = 500)
  private String rejectionReason;

  @Column(name = "report_link", length = 1000)
  private String reportLink;

  protected Incident() { }

  public Incident(
          Room room,
          User reportedBy,
          String incidentNumber,
          String description,
          boolean safetyHazard,
          boolean operationalImpact,
          int affectedArea,
          IncidentCategory category,
          IncidentPriority priority,
          IncidentStatus status
  ) {
    this.room = room;
    this.reportedBy = reportedBy;
    this.incidentNumber = incidentNumber;
    this.description = description;
    this.safetyHazard = safetyHazard;
    this.operationalImpact = operationalImpact;
    this.affectedArea = affectedArea;
    this.category = category;
    this.priority = priority;
    this.status = status;

    this.asset = null;
    this.assignedTo = null;
    this.evaluatedAt = null;
    this.resolvedAt = null;
    this.closedAt = null;
  }

  // Getters
  public Long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
  public LocalDateTime getResolvedAt() { return resolvedAt; }
  public LocalDateTime getClosedAt() { return closedAt; }
  public Asset getAsset() { return asset; }
  public Room getRoom() { return room; }
  public User getReportedBy() { return reportedBy; }
  public User getAssignedTo() { return assignedTo; }
  public String getIncidentNumber() { return incidentNumber; }
  public String getDescription() { return description; }
  public boolean getSafetyHazard() { return safetyHazard; }
  public boolean getOperationalImpact() { return operationalImpact; }
  public Integer getAffectedArea() { return affectedArea; }
  public IncidentCategory getCategory() { return category; }
  public IncidentPriority getPriority() { return priority; }
  public IncidentStatus getStatus() { return status; }
  public String getPhotoPath() { return photoPath; }
  public User getInspectedBy() { return inspectedBy; }
  public LocalDateTime getInspectedAt() { return inspectedAt; }
  public Boolean getAssetFunctional() { return assetFunctional; }
  public User getReviewedBy() { return reviewedBy; }
  public LocalDateTime getReviewedAt() { return reviewedAt; }
  public LocalDateTime getApprovedAt() { return approvedAt; }
  public LocalDateTime getAssignedAt() { return assignedAt; }
  public String getRejectionReason() { return rejectionReason; }
  public String getReportLink() { return reportLink; }
  public List<MaintenanceRecord> getMaintenanceRecords() { return maintenanceRecords; }

  // Setters
  public void setEvaluatedAt(LocalDateTime value) { evaluatedAt = value; }
  public void setResolvedAt(LocalDateTime value) { resolvedAt = value; }
  public void setClosedAt(LocalDateTime value) { closedAt = value; }
  public void setAsset(Asset value) { asset = value; }
  public void setRoom(Room value) { room = value; }
  public void setReportedBy(User value) { reportedBy = value; }
  public void setAssignedTo(User value) { assignedTo = value; }
  public void setIncidentNumber(String value) { incidentNumber = value; }
  public void setDescription(String value) { description = value; }
  public void setSafetyHazard(boolean value) { safetyHazard = value; }
  public void setOperationalImpact(boolean value) { operationalImpact = value; }
  public void setAffectedArea(Integer value) { affectedArea = value; }
  public void setCategory(IncidentCategory value) { category = value; }
  public void setPriority(IncidentPriority value) { priority = value; }
  public void setStatus(IncidentStatus value) { status = value; }
  public void setPhotoPath(String value) { photoPath = value; }
  public void setInspectedBy(User value) { inspectedBy = value; }
  public void setInspectedAt(LocalDateTime value) { inspectedAt = value; }
  public void setAssetFunctional(Boolean value) { assetFunctional = value; }
  public void setReviewedBy(User value) { reviewedBy = value; }
  public void setReviewedAt(LocalDateTime value) { reviewedAt = value; }
  public void setApprovedAt(LocalDateTime value) { approvedAt = value; }
  public void setAssignedAt(LocalDateTime value) { assignedAt = value; }
  public void setRejectionReason(String value) { rejectionReason = value; }
  public void setReportLink(String value) { reportLink = value; }
  public void removeMaintenanceRecord(MaintenanceRecord value) {
    maintenanceRecords.remove(value);
    value.setIncident(null);
  }
  public void addMaintenanceRecord(MaintenanceRecord value) {
    maintenanceRecords.add(value);
    value.setIncident(this);
  }
}
