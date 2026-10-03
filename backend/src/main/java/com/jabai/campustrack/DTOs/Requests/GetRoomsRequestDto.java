package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.RoomCriticality;
import com.jabai.campustrack.Models.Enums.RoomType;
    
import jakarta.validation.constraints.NotNull;

public class GetRoomsRequestDto {
    @NotNull(message="Building is required.")
    private final Long building_id; 
    
    private final RoomCriticality criticality;
    
    private final RoomType roomType;

    public GetRoomsRequestDto(Long building_id, RoomCriticality criticality, RoomType roomType) {
        this.building_id = building_id;
        this.criticality = criticality;
        this.roomType = roomType;
    }

   public Long getBuilding_id() {
       return building_id;
   }

   public RoomCriticality getCriticality() {
       return criticality;
   }

   public RoomType getRoomType() {
       return roomType;
   }
}
