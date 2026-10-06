package com.jabai.campustrack.Models;

import jakarta.persistence.*;
import org.hibernate.annotations.Generated;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "buildings")
public class Building {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private long id;

@Generated
  @Column(name = "created_at", updatable = false, insertable = false)
  private LocalDateTime createdAt;

  // Core columns
  // Rooms
  @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Room> rooms = new ArrayList<>();

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  protected Building() { }

  public Building(String name) {
    this.name = name;
  }

  // Getters
  public List<Room> getRooms() { return rooms; }
  public long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public String getName() { return name; }

  // Setters
  public void setName(String value) { name = value; }
  public void removeRoom(Room value) {
    rooms.remove(value);
    value.setBuilding(null);
  }
  public void addRoom(Room value) {
    rooms.add(value);
    value.setBuilding(this);
  }
}
