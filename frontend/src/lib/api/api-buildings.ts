import { apiClient } from "./api-client";
import type { PageResponse } from "@/types/page";
import type {
  BuildingResponseDto,
  CreateBuildingRequestDto,
  SearchBuildingParams,
  UpdateBuildingRequestDto,
} from "@/types/building";

export type {
  BuildingResponseDto,
  CreateBuildingRequestDto,
  SearchBuildingParams,
  UpdateBuildingRequestDto,
};

const DEFAULT_PAGE_SIZE = 20;

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

export async function getBuildings(
  params: PageParams = {}
): Promise<PageResponse<BuildingResponseDto>> {
  const { page = 1, size = DEFAULT_PAGE_SIZE } = params;
  return apiClient.get<PageResponse<BuildingResponseDto>>(
    `/api/buildings${buildQuery({ page, size })}`
  );
}

export async function searchBuildings(
  params: SearchBuildingParams & PageParams = {}
): Promise<PageResponse<BuildingResponseDto>> {
  const { name, from, to, page = 1, size = DEFAULT_PAGE_SIZE } = params;
  return apiClient.get<PageResponse<BuildingResponseDto>>(
    `/api/buildings/search${buildQuery({ name, from, to, page, size })}`
  );
}

export async function createBuilding(
  data: CreateBuildingRequestDto
): Promise<BuildingResponseDto> {
  return apiClient.post<BuildingResponseDto>("/api/buildings", data);
}

export async function updateBuilding(
  id: number,
  data: UpdateBuildingRequestDto
): Promise<BuildingResponseDto> {
  return apiClient.patch<BuildingResponseDto>(`/api/buildings/${id}`, data);
}

export async function deleteBuilding(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/buildings/${id}`);
}

export const buildingsApi = {
  getBuildings,
  searchBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
};

export default buildingsApi;
