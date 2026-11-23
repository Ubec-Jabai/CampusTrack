export enum NotificationType {
  INCIDENT_ASSIGNED = "INCIDENT_ASSIGNED",
  INCIDENT_APPROVED = "INCIDENT_APPROVED",
  INCIDENT_REJECTED = "INCIDENT_REJECTED",
}

export interface NotificationResponseDto {
  id: number;
  createdAt: string;
  userId: number;
  incidentId: number | null;
  type: NotificationType;
  message: string;
  readAt: string | null;
}

export interface NotificationUnreadCountResponseDto {
  unreadCount: number;
}

export interface UpdateNotificationRequestDto {
  read?: boolean;
}

export interface SearchNotificationParams {
  type?: NotificationType;
  read?: boolean;
}
