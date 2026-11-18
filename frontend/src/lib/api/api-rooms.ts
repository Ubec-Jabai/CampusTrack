import { apiClient } from "./api-client";
import type { PageResponse } from "@/types/page";
import type {
  CreateRoomRequestDto,
  RoomResponseDto,
  SearchRoomParams,
  UpdateRoomRequestDto,
} from "@/types/room";

export type {
  CreateRoomRequestDto,
  RoomResponseDto,
  SearchRoomParams,
  UpdateRoomRequestDto,
};
export { RoomCriticality, RoomType } from "@/types/room";

const DEFAULT_PAGE_SIZE = 10;

export interface PageParams {
  page?: number;
  size?: number;
}

type QueryValue = string | number | undefined;

function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query.length > 0 ? `?${query}` : "";
}

export async function getRooms(
  params: PageParams = {}
): Promise<PageResponse<RoomResponseDto>> {
  const { page = 1, size = DEFAULT_PAGE_SIZE } = params;
  return apiClient.get<PageResponse<RoomResponseDto>>(
    `/api/rooms${buildQuery({ page, size })}`
  );
}

export async function getRoom(id: number): Promise<RoomResponseDto> {
  return apiClient.get<RoomResponseDto>(`/api/rooms/${id}`);
}

export async function searchRooms(
  params: SearchRoomParams & PageParams = {}
): Promise<PageResponse<RoomResponseDto>> {
  const {
    buildingId,
    roomNumber,
    capacity,
    roomType,
    criticality,
    from,
    to,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  } = params;
  return apiClient.get<PageResponse<RoomResponseDto>>(
    `/api/rooms/search${buildQuery({
      buildingId,
      roomNumber,
      capacity,
      roomType,
      criticality,
      from,
      to,
      page,
      size,
    })}`
  );
}

export async function createRoom(
  data: CreateRoomRequestDto
): Promise<RoomResponseDto> {
  return apiClient.post<RoomResponseDto>("/api/rooms", data);
}

export async function updateRoom(
  id: number,
  data: UpdateRoomRequestDto
): Promise<RoomResponseDto> {
  return apiClient.patch<RoomResponseDto>(`/api/rooms/${id}`, data);
}

export async function deleteRoom(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/rooms/${id}`);
}

export const roomsApi = {
  getRooms,
  getRoom,
  searchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};

export default roomsApi;

// Usage:
// const rooms = await roomsApi.getRooms({ page: 1 });
// const room = await roomsApi.getRoom(1);
// const found = await roomsApi.searchRooms({ buildingId: 1, roomType: RoomType.LABORATORY });
// const created = await roomsApi.createRoom({ buildingId: 1, roomNumber: "101", capacity: 40, roomType: RoomType.CLASSROOM, criticality: RoomCriticality.NORMAL });
// const updated = await roomsApi.updateRoom(1, { capacity: 50 });
// await roomsApi.deleteRoom(1);
