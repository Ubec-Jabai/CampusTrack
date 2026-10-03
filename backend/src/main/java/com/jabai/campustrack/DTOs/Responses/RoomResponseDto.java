package com.jabai.campustrack.DTOs.Responses;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jabai.campustrack.Models.Building;
import com.jabai.campustrack.Models.Enums.RoomCriticality;
import com.jabai.campustrack.Models.Enums.RoomType;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomResponseDto {

    private final long id;
    private final LocalDateTime createdAt;
    private final BuildingResponseDto building;
    private final String room_number;
    private final int capacity;
    private final RoomType room_type;
    private final RoomCriticality criticality;

    public RoomResponseDto(long id, LocalDateTime createdAt, Building building, String room_number, int capacity, RoomType room_type, RoomCriticality criticality) {
        this.id = id;
        this.createdAt = createdAt;
        if (building != null) {
            this.building = new BuildingResponseDto(building.getId(), building.getName(), building.getCreatedAt()); // removes rooms
        } else {
            this.building = null;
        }
        this.room_number = room_number;
        this.capacity = capacity;
        this.room_type = room_type;
        this.criticality = criticality;
    }

    public long getId() {
        return id;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public BuildingResponseDto getBuilding() {
        return building;
    }
    public String getRoom_number() {
        return room_number;
    }
    public int getCapacity() {
        return capacity;
    }
    public RoomType getRoom_type() {
        return room_type;
    }
    public RoomCriticality getCriticality() {
        return criticality;
    }

}
