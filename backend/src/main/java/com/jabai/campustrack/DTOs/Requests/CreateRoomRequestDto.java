package com.jabai.campustrack.DTOs.Requests;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import com.jabai.campustrack.Models.Enums.RoomCriticality;
import com.jabai.campustrack.Models.Enums.RoomType;

public class CreateRoomRequestDto {
    @NotNull(message="Building is required.")
    private final Long building_id; 

    @NotEmpty(message="Room number is required.")
    private final String room_number;

    @NotNull(message="Capacity is required.")
    @Positive 
    private final Integer capacity;

    @NotNull(message="Room Type is required.")
    private final RoomType room_type;

    @NotNull(message="Criticality is required.")
    private final RoomCriticality criticality;
    
    public CreateRoomRequestDto(Long building_id, String room_number, Integer capacity, RoomType room_type, RoomCriticality criticality) {
        this.building_id = building_id;
        this.room_number = room_number;
        this.capacity = capacity;
        this.room_type = room_type;
        this.criticality = criticality;
    }

    public long getBuilding_id() {
        return building_id;
    }
    public int getCapacity() {
        return capacity;
    }
    public RoomCriticality getCriticality() {
        return criticality;
    }
    public String getRoom_number() {
        return room_number;
    }
    public RoomType getRoom_type() {
        return room_type;
    }
}
