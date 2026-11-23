import type { AssetResponseDto } from "./asset";
import type { RoomResponseDto } from "./room";
import type { UserProfileResponseDto } from "./profile";

export enum IncidentCategory {
  EQUIPMENT_FAILURE = "EQUIPMENT_FAILURE",
  ELECTRICAL = "ELECTRICAL",
  PLUMBING = "PLUMBING",
  STRUCTURAL = "STRUCTURAL",
  HVAC = "HVAC",
  NETWORK_IT = "NETWORK_IT",
  FURNITURE = "FURNITURE",
  SAFETY_HAZARD = "SAFETY_HAZARD",
  OTHER = "OTHER",
}

export enum IncidentPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum IncidentStatus {
  REPORTED = "REPORTED",
  INSPECTING = "INSPECTING",
  REJECTED = "REJECTED",
  PENDING_REVIEW = "PENDING_REVIEW",
  DECLINED = "DECLINED",
  APPROVED = "APPROVED",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export interface IncidentResponseDto {
  id: number;
  createdAt: string;
  evaluatedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  room: RoomResponseDto | null;
  roomId: number | null;
  reportedBy: UserProfileResponseDto | null;
  reportedById: number | null;
  asset: AssetResponseDto | null;
  assetId: number | null;
  assigned: UserProfileResponseDto | null;
  assignedToId: number | null;
  assignedAt: string | null;
  incidentNumber: string;
  description: string;
  photoPath: string | null;
  safetyHazard: boolean;
  operationalImpact: boolean;
  affectedArea: number;
  category: IncidentCategory | null;
  priority: IncidentPriority | null;
  status: IncidentStatus;
  inspectedBy: UserProfileResponseDto | null;
  inspectedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export interface IncidentPhotoResponseDto {
  filename: string;
  link: string;
}

export interface CreateIncidentRequestDto {
  roomId: number;
  reportedById: number;
  category: IncidentCategory;
  status: IncidentStatus;
  incidentNumber: string;
  description: string;
  safetyHazard: boolean;
  operationalImpact: boolean;
  affectedArea: number;
  assetId?: number;
  assignedToId?: number;
  evaluatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface UpdateIncidentRequestDto {
  roomId?: number;
  reportedById?: number;
  assetId?: number;
  assignedToId?: number;
  category?: IncidentCategory;
  status?: IncidentStatus;
  incidentNumber?: string;
  description?: string;
  safetyHazard?: boolean;
  operationalImpact?: boolean;
  affectedArea?: number;
  evaluatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  rejectionReason?: string;
}

export interface SearchIncidentParams {
  from?: string;
  to?: string;
  assetId?: number;
  roomId?: number;
  reportedById?: number;
  assignedToId?: number;
  incidentNumber?: string;
  description?: string;
  safetyHazard?: boolean;
  operationalImpact?: boolean;
  affectedArea?: number;
  category?: IncidentCategory;
  priority?: IncidentPriority;
  status?: IncidentStatus;
}
