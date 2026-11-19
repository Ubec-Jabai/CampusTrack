package com.jabai.campustrack.Models;

import com.jabai.campustrack.Models.Enums.AssetCategory;
import com.jabai.campustrack.Models.Enums.AssetCondition;
import com.jabai.campustrack.Models.Enums.AssetCriticality;
import com.jabai.campustrack.Models.Enums.AssetStatus;
import com.jabai.campustrack.Models.Enums.Specialty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assets")
public class Asset {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "created_at", updatable = false, insertable = false)
  private LocalDateTime createdAt;

  // Core columns
  // Nfc tags
  @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<NfcTag> nfcTags = new ArrayList<>();

  // Room
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "room_id", nullable = false)
  private Room room;

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "brand", length = 100)
  private String brand;

  @Column(name = "model", length = 100)
  private String model;

  @Column(name = "serial_number", length = 100)
  private String serialNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "category", nullable = false)
  private AssetCategory category;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private AssetStatus status;

  @Enumerated(EnumType.STRING)
  @Column(name = "asset_condition", nullable = false)
  private AssetCondition condition;

  @Enumerated(EnumType.STRING)
  @Column(name = "criticality", nullable = false)
  private AssetCriticality criticality;

  @Enumerated(EnumType.STRING)
  @Column(name = "specialty", nullable = false, length = 50)
  private Specialty specialty;

  protected Asset() { }

  public Asset(
          Room room,
          String name,
          AssetCategory category,
          AssetStatus status,
          AssetCondition condition,
          AssetCriticality criticality,
          Specialty specialty
  ) {
    this.room = room;
    this.name = name;
    this.brand = null;
    this.model = null;
    this.serialNumber = null;
    this.category = category;
    this.status = status;
    this.condition = condition;
    this.criticality = criticality;
    this.specialty = specialty;
  }

  public Asset(
          Room room,
          String name,
          String brand,
          String model,
          String serialNumber,
          AssetCategory category,
          AssetStatus status,
          AssetCondition condition,
          AssetCriticality criticality,
          Specialty specialty
  ) {
    this.room = room;
    this.name = name;
    this.brand = brand;
    this.model = model;
    this.serialNumber = serialNumber;
    this.category = category;
    this.status = status;
    this.condition = condition;
    this.criticality = criticality;
    this.specialty = specialty;
  }

  // Getters
  public List<NfcTag> getNfcTags() { return nfcTags; }
  public Long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public Room getRoom() { return room; }
  public String getName() { return name; }
  public String getBrand() { return brand; }
  public String getModel() { return model; }
  public String getSerialNumber() { return serialNumber; }
  public AssetCategory getCategory() { return category; }
  public AssetStatus getStatus() { return status; }
  public AssetCondition getCondition() { return condition; }
  public AssetCriticality getCriticality() { return criticality; }
  public Specialty getSpecialty() { return specialty; }

  // Setters
  public void setRoom(Room value) { room = value; }
  public void setName(String value) { name = value; }
  public void setBrand(String value) { brand = value; }
  public void setModel(String value) { model = value; }
  public void setSerialNumber(String value) { serialNumber = value; }
  public void setCategory(AssetCategory value) { category = value; }
  public void setStatus(AssetStatus value) { status = value; }
  public void setCondition(AssetCondition value) { condition = value; }
  public void setCriticality(AssetCriticality value) { criticality = value; }
  public void setSpecialty(Specialty value) { specialty = value; }
  public void removeNfcTag(NfcTag value) {
    nfcTags.remove(value);
    value.setAsset(null);
  }
  public void addNfcTag(NfcTag value) {
    nfcTags.add(value);
    value.setAsset(this);
  }
}
