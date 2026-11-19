import {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
} from "@/types/incident";

export interface IncidentOption<T extends string> {
  id: T;
  label: string;
}

export const INCIDENT_CATEGORY_OPTIONS: IncidentOption<IncidentCategory>[] = [
  { id: IncidentCategory.EQUIPMENT_FAILURE, label: "Equipment failure" },
  { id: IncidentCategory.ELECTRICAL, label: "Electrical" },
  { id: IncidentCategory.PLUMBING, label: "Plumbing" },
  { id: IncidentCategory.STRUCTURAL, label: "Structural" },
  { id: IncidentCategory.HVAC, label: "HVAC" },
  { id: IncidentCategory.NETWORK_IT, label: "Network and IT" },
  { id: IncidentCategory.FURNITURE, label: "Furniture" },
  { id: IncidentCategory.SAFETY_HAZARD, label: "Safety hazard" },
  { id: IncidentCategory.OTHER, label: "Other" },
];

export const INCIDENT_PRIORITY_OPTIONS: IncidentOption<IncidentPriority>[] = [
  { id: IncidentPriority.LOW, label: "Low" },
  { id: IncidentPriority.MEDIUM, label: "Medium" },
  { id: IncidentPriority.HIGH, label: "High" },
  { id: IncidentPriority.CRITICAL, label: "Critical" },
];

export const INCIDENT_STATUS_OPTIONS: IncidentOption<IncidentStatus>[] = [
  { id: IncidentStatus.REPORTED, label: "Reported" },
  { id: IncidentStatus.INSPECTING, label: "Inspecting" },
  { id: IncidentStatus.REJECTED, label: "Rejected" },
  { id: IncidentStatus.PENDING_REVIEW, label: "Pending review" },
  { id: IncidentStatus.DECLINED, label: "Declined" },
  { id: IncidentStatus.APPROVED, label: "Approved" },
  { id: IncidentStatus.ASSIGNED, label: "Assigned" },
  { id: IncidentStatus.IN_PROGRESS, label: "In progress" },
  { id: IncidentStatus.RESOLVED, label: "Resolved" },
];

export function isIncidentOptionValue<T extends string>(
  options: IncidentOption<T>[],
  value: string
): value is T {
  return options.some((option) => option.id === value);
}
