package com.jabai.campustrack.Repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Models.Enums.RoomCriticality;
import com.jabai.campustrack.Models.Enums.RoomType;  

@Repository 
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("""
        SELECT r FROM Room r
        WHERE (:buildingId IS NULL OR r.building.id = :buildingId)
          AND (:criticality IS NULL OR r.criticality = :criticality)
          AND (:roomType IS NULL OR r.roomType = :roomType)
        """)
    Page<Room> search(@Param("buildingId") Long buildingId,
                          @Param("criticality") RoomCriticality criticality,
                          @Param("roomType") RoomType roomType,
                          Pageable pageable);
}
