package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateRoomRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateRoomRequestDto;
import com.jabai.campustrack.DTOs.Responses.RoomResponseDto;
import com.jabai.campustrack.DTOs.Requests.GetRoomsRequestDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jabai.campustrack.Services.RoomService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

  private final RoomService roomService;

  public RoomController(RoomService roomService) {
    this.roomService = roomService;
  }

  @PostMapping
  public ResponseEntity<RoomResponseDto> createRoom(@Valid @RequestBody CreateRoomRequestDto createRoomRequestDto) {
    RoomResponseDto responseDto = roomService.createRoom(createRoomRequestDto);
    return ResponseEntity.ok(responseDto);
  }

  @GetMapping
  public ResponseEntity<Page<RoomResponseDto>> getRooms(@Valid GetRoomsRequestDto getRoomsRequestDto, @PageableDefault(size=10) Pageable pageable) {
    Page<RoomResponseDto> responseDto = roomService.getRooms(getRoomsRequestDto, pageable);
    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/{id}")
  public ResponseEntity<RoomResponseDto> getRoom(@PathVariable Long id) {
    RoomResponseDto responseDto = roomService.getRoom(id);
    return ResponseEntity.ok(responseDto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<RoomResponseDto> updateRoom(@PathVariable Long id, @RequestBody UpdateRoomRequestDto updateRoomRequestDto) {
    RoomResponseDto responseDto = roomService.updateRoom(id, updateRoomRequestDto);
    return ResponseEntity.ok(responseDto);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<RoomResponseDto> deleteRoom(@PathVariable Long id) {
    roomService.deleteRoom(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/hello-world")
  public ResponseEntity<String> helloWorld() {
    return ResponseEntity.ok("Hello world from rooms ;D");
  }
}
