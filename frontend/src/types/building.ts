export interface BuildingResponseDto {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateBuildingRequestDto {
  name: string;
}

export interface UpdateBuildingRequestDto {
  name: string;
}

export interface SearchBuildingParams {
  name?: string;
  from?: string;
  to?: string;
}
