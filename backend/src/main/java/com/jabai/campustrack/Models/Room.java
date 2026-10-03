package com.jabai.campustrack.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.Generated;

import com.jabai.campustrack.Models.Enums.RoomCriticality;
import com.jabai.campustrack.Models.Enums.RoomType;

@Entity
@Table(
        name = "rooms",
        uniqueConstraints = @UniqueConstraint(columnNames = {"building_id", "room_number" })
)
public class Room {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private long id;

  @Generated
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  // Core columns
  // Building
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "building_id", nullable = false)
  private Building building;

  @Column(name = "room_number", nullable = false, length = 50)
  private String roomNumber;

  @Column(name = "capacity", nullable = false)
  private int capacity;

  @Enumerated(EnumType.STRING)
  @Column(name = "room_type", nullable = false)
  private RoomType roomType;

  @Enumerated(EnumType.STRING)
  @Column(name = "criticality", nullable = false)
  private RoomCriticality criticality;

  protected Room() { }

  public Room(Building building, String roomNumber, int capacity, RoomType roomType, RoomCriticality criticality) {
    this.building = building;
    this.roomNumber = roomNumber;
    this.capacity = capacity;
    this.roomType = roomType;
    this.criticality = criticality;
  }

  // Getters
  public Building getBuilding() { return building; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public String getRoomNumber() { return roomNumber; }
  public int getCapacity() { return capacity; }
  public RoomType getRoomType() { return roomType; }
  public RoomCriticality getCriticality() { return criticality; }
  public long getId() { return id; }

  // Setters
  public void setBuilding(Building value) { building = value; }
  public void setRoomNumber(String value) { roomNumber = value; }
  public void setCapacity(int value) { capacity = value; }
  public void setRoomType(RoomType value) { roomType = value; }
  public void setCriticality(RoomCriticality value) { criticality = value; }

}
