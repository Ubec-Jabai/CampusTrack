import { apiClient } from "./api-client";
import type { PageResponse } from "@/types/page";
import type {
  AssetResponseDto,
  CreateAssetRequestDto,
  SearchAssetParams,
  UpdateAssetRequestDto,
} from "@/types/asset";

export type {
  AssetResponseDto,
  CreateAssetRequestDto,
  SearchAssetParams,
  UpdateAssetRequestDto,
};
export { AssetCategory, AssetCondition, AssetCriticality, AssetStatus } from "@/types/asset";

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

export async function getAssets(
  params: PageParams = {}
): Promise<PageResponse<AssetResponseDto>> {
  const { page = 1, size = DEFAULT_PAGE_SIZE } = params;
  return apiClient.get<PageResponse<AssetResponseDto>>(
    `/api/assets${buildQuery({ page, size })}`
  );
}

export async function getAsset(id: number): Promise<AssetResponseDto> {
  return apiClient.get<AssetResponseDto>(`/api/assets/${id}`);
}

export async function searchAssets(
  params: SearchAssetParams & PageParams = {}
): Promise<PageResponse<AssetResponseDto>> {
  const {
    id,
    roomId,
    name,
    brand,
    model,
    serialNumber,
    category,
    status,
    condition,
    criticality,
    from,
    to,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  } = params;
  return apiClient.get<PageResponse<AssetResponseDto>>(
    `/api/assets/search${buildQuery({
      id,
      roomId,
      name,
      brand,
      model,
      serialNumber,
      category,
      status,
      condition,
      criticality,
      from,
      to,
      page,
      size,
    })}`
  );
}

export async function createAsset(
  data: CreateAssetRequestDto
): Promise<AssetResponseDto> {
  return apiClient.post<AssetResponseDto>("/api/assets", data);
}

export async function updateAsset(
  id: number,
  data: UpdateAssetRequestDto
): Promise<AssetResponseDto> {
  return apiClient.patch<AssetResponseDto>(`/api/assets/${id}`, data);
}

export async function deleteAsset(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/assets/${id}`);
}

export const assetsApi = {
  getAssets,
  getAsset,
  searchAssets,
  createAsset,
  updateAsset,
  deleteAsset,
};

export default assetsApi;

// Usage:
// const assets = await assetsApi.getAssets({ page: 1 });
// const asset = await assetsApi.getAsset(1);
// const found = await assetsApi.searchAssets({ roomId: 1, category: AssetCategory.COMPUTER });
// const created = await assetsApi.createAsset({ roomId: 1, name: "Projector", brand: "Epson", model: "EB-X49", serialNumber: "SN-001", category: AssetCategory.PROJECTOR, status: AssetStatus.IN_USE, condition: AssetCondition.GOOD, criticality: AssetCriticality.NORMAL });
// const updated = await assetsApi.updateAsset(1, { status: AssetStatus.UNDER_MAINTENANCE });
// await assetsApi.deleteAsset(1);
