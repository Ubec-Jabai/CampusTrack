import type { BuildingResponseDto } from "./building";

export enum RoomType {
  CLASSROOM = "CLASSROOM",
  LABORATORY = "LABORATORY",
  LECTURE_HALL = "LECTURE_HALL",
  OFFICE = "OFFICE",
  SERVER_ROOM = "SERVER_ROOM",
  STORAGE = "STORAGE",
  WORKSHOP = "WORKSHOP",
  CONFERENCE_ROOM = "CONFERENCE_ROOM",
  RESTROOM = "RESTROOM",
  OTHER = "OTHER",
}

export enum RoomCriticality {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface RoomResponseDto {
  id: number;
  createdAt: string;
  building: BuildingResponseDto;
  roomNumber: string;
  capacity: number;
  roomType: RoomType;
  criticality: RoomCriticality;
}

export interface CreateRoomRequestDto {
  buildingId: number;
  roomNumber: string;
  capacity: number;
  roomType: RoomType;
  criticality: RoomCriticality;
}

export interface UpdateRoomRequestDto {
  buildingId?: number;
  roomNumber?: string;
  capacity?: number;
  roomType?: RoomType;
  criticality?: RoomCriticality;
}

export interface SearchRoomParams {
  buildingId?: number;
  roomNumber?: string;
  capacity?: number;
  roomType?: RoomType;
  criticality?: RoomCriticality;
  from?: string;
  to?: string;
}
