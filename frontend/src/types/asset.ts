import type { RoomResponseDto } from "./room";

export enum AssetCategory {
  COMPUTER = "COMPUTER",
  PROJECTOR = "PROJECTOR",
  AIRCONDITIONER = "AIRCONDITIONER",
  FURNITURE = "FURNITURE",
  NETWORK_EQUIPMENT = "NETWORK_EQUIPMENT",
  LAB_EQUIPMENT = "LAB_EQUIPMENT",
  ELECTRICAL_EQUIPMENT = "ELECTRICAL_EQUIPMENT",
  OFFICE_EQUIPMENT = "OFFICE_EQUIPMENT",
  OTHER = "OTHER",
}

export enum AssetStatus {
  IN_USE = "IN_USE",
  AVAILABLE = "AVAILABLE",
  UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
  RETIRED = "RETIRED",
}

export enum AssetCondition {
  GOOD = "GOOD",
  FAIR = "FAIR",
  DAMAGED = "DAMAGED",
  POOR = "POOR",
}

export enum AssetCriticality {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface AssetResponseDto {
  id: number;
  createdAt: string;
  room: RoomResponseDto | null;
  roomId: number | null;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  category: AssetCategory;
  status: AssetStatus;
  condition: AssetCondition;
  criticality: AssetCriticality;
}

export interface CreateAssetRequestDto {
  roomId: number;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category: AssetCategory;
  status: AssetStatus;
  condition: AssetCondition;
  criticality: AssetCriticality;
}

export interface UpdateAssetRequestDto {
  roomId?: number;
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category?: AssetCategory;
  status?: AssetStatus;
  condition?: AssetCondition;
  criticality?: AssetCriticality;
}

export interface SearchAssetParams {
  id?: number;
  roomId?: number;
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category?: AssetCategory;
  status?: AssetStatus;
  condition?: AssetCondition;
  criticality?: AssetCriticality;
  from?: string;
  to?: string;
}
