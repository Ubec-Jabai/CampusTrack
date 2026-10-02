package com.jabai.campustrack.Models;

import com.jabai.campustrack.Models.Enums.NfcTagStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.Generated;

import java.time.LocalDateTime;

@Entity
@Table(name = "nfc_tags")
public class NfcTag {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private long id;

  @Column(name = "created_at", updatable = false, insertable = false)
  @Generated
  private LocalDateTime createdAt;

  // Core columns
  // Asset
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "asset_id", nullable = false)
  private Asset asset;

  @Column(name = "uid", nullable = false, unique = true, length = 100)
  private String uid;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private NfcTagStatus status;

  protected NfcTag() { }

  public NfcTag(Asset asset, String uid, NfcTagStatus status) {
    this.asset = asset;
    this.uid = uid;
    this.status = status;
  }

  // Getters
  public long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public Asset getAsset() { return asset; }
  public String getUid() { return uid; }
  public NfcTagStatus getStatus() { return status; }

  // Setters
  public void setAsset(Asset asset) { this.asset = asset; }
  public void setUid(String uid) { this.uid = uid; }
  public void setStatus(NfcTagStatus status) { this.status = status; }
}
