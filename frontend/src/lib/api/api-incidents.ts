import { apiClient, apiFetch } from "./api-client";
import type { PageResponse } from "@/types/page";
import type {
  CreateIncidentRequestDto,
  IncidentPhotoResponseDto,
  IncidentResponseDto,
  SearchIncidentParams,
  UpdateIncidentRequestDto,
} from "@/types/incident";

export type {
  CreateIncidentRequestDto,
  IncidentPhotoResponseDto,
  IncidentResponseDto,
  SearchIncidentParams,
  UpdateIncidentRequestDto,
};
export { IncidentCategory, IncidentPriority, IncidentStatus } from "@/types/incident";

const DEFAULT_PAGE_SIZE = 10;

export interface PageParams {
  page?: number;
  size?: number;
}

type QueryValue = string | number | boolean | undefined;

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

export async function getIncidents(
  params: PageParams = {}
): Promise<PageResponse<IncidentResponseDto>> {
  const { page = 1, size = DEFAULT_PAGE_SIZE } = params;
  return apiClient.get<PageResponse<IncidentResponseDto>>(
    `/api/incidents${buildQuery({ page, size })}`
  );
}

export async function getIncident(id: number): Promise<IncidentResponseDto> {
  return apiClient.get<IncidentResponseDto>(`/api/incidents/${id}`);
}

export async function getIncidentPhoto(id: number): Promise<IncidentPhotoResponseDto> {
  return apiClient.get<IncidentPhotoResponseDto>(`/api/incidents/${id}/photo`);
}

export async function searchIncidents(
  params: SearchIncidentParams & PageParams = {}
): Promise<PageResponse<IncidentResponseDto>> {
  const {
    from,
    to,
    assetId,
    roomId,
    reportedById,
    assignedToId,
    incidentNumber,
    description,
    safetyHazard,
    operationalImpact,
    affectedArea,
    category,
    priority,
    status,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  } = params;
  return apiClient.get<PageResponse<IncidentResponseDto>>(
    `/api/incidents/search${buildQuery({
      from,
      to,
      assetId,
      roomId,
      reportedById,
      assignedToId,
      incidentNumber,
      description,
      safetyHazard,
      operationalImpact,
      affectedArea,
      category,
      priority,
      status,
      page,
      size,
    })}`
  );
}

export async function createIncident(
  data: CreateIncidentRequestDto & { assetId: number },
  image: File
): Promise<IncidentResponseDto> {
  const formData = new FormData();
  formData.append(
    "incident",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
  formData.append("image", image);

  return apiFetch<IncidentResponseDto>("/api/incidents", {
    method: "POST",
    body: formData,
  });
}

export async function updateIncident(
  id: number,
  data: UpdateIncidentRequestDto
): Promise<IncidentResponseDto> {
  return apiClient.patch<IncidentResponseDto>(`/api/incidents/${id}`, data);
}

export async function deleteIncident(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/incidents/${id}`);
}

export const incidentsApi = {
  getIncidents,
  getIncident,
  getIncidentPhoto,
  searchIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
};

export default incidentsApi;

// Usage:
// const incidents = await incidentsApi.getIncidents({ page: 1 });
// const incident = await incidentsApi.getIncident(1);
// const found = await incidentsApi.searchIncidents({ roomId: 1, status: IncidentStatus.REPORTED, safetyHazard: true });
// const created = await incidentsApi.createIncident({ roomId: 1, reportedById: 1, category: IncidentCategory.EQUIPMENT_FAILURE, priority: IncidentPriority.HIGH, status: IncidentStatus.REPORTED, incidentNumber: "INC-001", description: "Projector not turning on", safetyHazard: false, operationalImpact: true, affectedArea: 40 }, imageFile);
// const updated = await incidentsApi.updateIncident(1, { status: IncidentStatus.IN_PROGRESS, assignedToId: 2 });
// await incidentsApi.deleteIncident(1);
