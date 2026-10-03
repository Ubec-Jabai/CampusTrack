package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Responses.RoomResponseDto;
import com.jabai.campustrack.Models.Building;
import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Repositories.RoomRepository;
import com.jabai.campustrack.Repositories.BuildingRepository;
import com.jabai.campustrack.DTOs.Requests.CreateRoomRequestDto;
import com.jabai.campustrack.DTOs.Requests.GetRoomsRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateRoomRequestDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service 
public class RoomService {
    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;

    public RoomService(RoomRepository roomRepository, BuildingRepository buildingRepository) {
        this.roomRepository = roomRepository;
        this.buildingRepository = buildingRepository;
    }

    public RoomResponseDto createRoom(CreateRoomRequestDto createRoomRequestDto) {
        Building building = buildingRepository.findById(createRoomRequestDto.getBuilding_id()).orElse(null);

        if (building == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Building does not exist.");
        }

        Room room = new Room(
            building,
            createRoomRequestDto.getRoom_number(),
            createRoomRequestDto.getCapacity(),
            createRoomRequestDto.getRoom_type(),
            createRoomRequestDto.getCriticality()
        );
    
        roomRepository.save(room);
        return roomsResponseJson(room, false);
    }

    public Page<RoomResponseDto> getRooms(GetRoomsRequestDto getRoomsRequestDto, Pageable pageable) {
        Long buildingID = getRoomsRequestDto.getBuilding_id();
        Page<Room> fetchedRooms = roomRepository.search(buildingID, getRoomsRequestDto.getCriticality(), getRoomsRequestDto.getRoomType(), pageable);
        return fetchedRooms.map(toMap -> roomsResponseJson(toMap, true));
    }

    public RoomResponseDto getRoom(long roomId) {
        Room fetchedRoom = roomRepository.findById(roomId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));

        return roomsResponseJson(fetchedRoom, false);
    }
    
    public RoomResponseDto updateRoom(long roomId, UpdateRoomRequestDto updateRoomRequestDto) {
        Room Savedroom = roomRepository.findById(roomId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));

        if (updateRoomRequestDto.getBuilding_id() != null) {
            Building building = buildingRepository.findById(updateRoomRequestDto.getBuilding_id()).orElse(null);
            if (building == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Building id not found.");
            }
        }

        if (updateRoomRequestDto.getCapacity() != null) {Savedroom.setCapacity(updateRoomRequestDto.getCapacity());}
        if (updateRoomRequestDto.getCriticality() != null) {Savedroom.setCriticality(updateRoomRequestDto.getCriticality());}
        if (updateRoomRequestDto.getRoom_type() != null) {Savedroom.setRoomType(updateRoomRequestDto.getRoom_type());}
        if (updateRoomRequestDto.getRoom_number() != null) {Savedroom.setRoomNumber(updateRoomRequestDto.getRoom_number());}
        
        roomRepository.save(Savedroom);
        return roomsResponseJson(Savedroom, false);
    }

    public RoomResponseDto deleteRoom(long roomId) {
        Room SavedRoom = roomRepository.findById(roomId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));
        
        roomRepository.delete(SavedRoom);
        return roomsResponseJson(SavedRoom, false);
    }

    private RoomResponseDto roomsResponseJson(Room room, boolean noBuilding) {
        return new RoomResponseDto(
            room.getId(), 
            room.getCreatedAt(), 
            noBuilding == true ? null : room.getBuilding(), 
            room.getRoomNumber(), 
            room.getCapacity(), 
            room.getRoomType(), 
            room.getCriticality()
        );
    }
}
