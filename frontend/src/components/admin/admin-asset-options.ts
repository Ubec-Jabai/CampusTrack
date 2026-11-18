import {
  AssetCategory,
  AssetCondition,
  AssetCriticality,
  AssetStatus,
} from "@/types/asset";

export interface AssetOption<T extends string> {
  id: T;
  label: string;
}

export const ASSET_CATEGORY_OPTIONS: AssetOption<AssetCategory>[] = [
  { id: AssetCategory.COMPUTER, label: "Computer" },
  { id: AssetCategory.PROJECTOR, label: "Projector" },
  { id: AssetCategory.AIRCONDITIONER, label: "Air conditioner" },
  { id: AssetCategory.FURNITURE, label: "Furniture" },
  { id: AssetCategory.NETWORK_EQUIPMENT, label: "Network equipment" },
  { id: AssetCategory.LAB_EQUIPMENT, label: "Lab equipment" },
  { id: AssetCategory.ELECTRICAL_EQUIPMENT, label: "Electrical equipment" },
  { id: AssetCategory.OFFICE_EQUIPMENT, label: "Office equipment" },
  { id: AssetCategory.OTHER, label: "Other" },
];

export const ASSET_STATUS_OPTIONS: AssetOption<AssetStatus>[] = [
  { id: AssetStatus.IN_USE, label: "In use" },
  { id: AssetStatus.AVAILABLE, label: "Available" },
  { id: AssetStatus.UNDER_MAINTENANCE, label: "Under maintenance" },
  { id: AssetStatus.OUT_OF_SERVICE, label: "Out of service" },
  { id: AssetStatus.RETIRED, label: "Retired" },
];

export const ASSET_CONDITION_OPTIONS: AssetOption<AssetCondition>[] = [
  { id: AssetCondition.GOOD, label: "Good" },
  { id: AssetCondition.FAIR, label: "Fair" },
  { id: AssetCondition.DAMAGED, label: "Damaged" },
  { id: AssetCondition.POOR, label: "Poor" },
];

export const ASSET_CRITICALITY_OPTIONS: AssetOption<AssetCriticality>[] = [
  { id: AssetCriticality.LOW, label: "Low" },
  { id: AssetCriticality.NORMAL, label: "Normal" },
  { id: AssetCriticality.HIGH, label: "High" },
  { id: AssetCriticality.CRITICAL, label: "Critical" },
];

export function isOptionValue<T extends string>(
  options: AssetOption<T>[],
  value: string
): value is T {
  return options.some((option) => option.id === value);
}
