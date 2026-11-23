import { apiClient } from "./api-client";
import type { PageResponse } from "@/types/page";
import type {
  NotificationResponseDto,
  NotificationUnreadCountResponseDto,
  SearchNotificationParams,
  UpdateNotificationRequestDto,
} from "@/types/notification";

export type {
  NotificationResponseDto,
  NotificationUnreadCountResponseDto,
  SearchNotificationParams,
  UpdateNotificationRequestDto,
};
export { NotificationType } from "@/types/notification";

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

export async function getNotifications(
  params: SearchNotificationParams & PageParams = {}
): Promise<PageResponse<NotificationResponseDto>> {
  const { type, read, page = 1, size = DEFAULT_PAGE_SIZE } = params;
  return apiClient.get<PageResponse<NotificationResponseDto>>(
    `/api/notifications${buildQuery({ type, read, page, size })}`
  );
}

export async function getUnreadCount(): Promise<NotificationUnreadCountResponseDto> {
  return apiClient.get<NotificationUnreadCountResponseDto>(
    "/api/notifications/unread-count"
  );
}

export async function getNotification(
  id: number
): Promise<NotificationResponseDto> {
  return apiClient.get<NotificationResponseDto>(`/api/notifications/${id}`);
}

export async function updateNotification(
  id: number,
  data: UpdateNotificationRequestDto
): Promise<NotificationResponseDto> {
  return apiClient.patch<NotificationResponseDto>(`/api/notifications/${id}`, data);
}

export const notificationsApi = {
  getNotifications,
  getUnreadCount,
  getNotification,
  updateNotification,
};

export default notificationsApi;

// Usage:
// const notifications = await notificationsApi.getNotifications({ page: 1 });
// const unread = await notificationsApi.getUnreadCount();
// const found = await notificationsApi.getNotifications({ read: false, type: NotificationType.INCIDENT_ASSIGNED });
// const notification = await notificationsApi.getNotification(1);
// const updated = await notificationsApi.updateNotification(1, { read: true });
