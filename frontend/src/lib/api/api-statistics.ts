import { apiClient } from "./api-client";
import type {
  StatisticsResponseDto,
  WorkerStatisticsResponseDto,
} from "@/types/statistics";

export type { StatisticsResponseDto, WorkerStatisticsResponseDto };

export async function getAdminStatistics(): Promise<StatisticsResponseDto> {
  return apiClient.get<StatisticsResponseDto>("/api/statistics");
}

export async function getWorkerStatistics(): Promise<WorkerStatisticsResponseDto> {
  return apiClient.get<WorkerStatisticsResponseDto>("/api/statistics/worker");
}

export const statisticsApi = {
  getAdminStatistics,
  getWorkerStatistics,
};

export default statisticsApi;
