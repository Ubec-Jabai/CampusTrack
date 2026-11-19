import { apiClient } from "./api-client";
import type { StatisticsResponseDto } from "@/types/statistics";

export type { StatisticsResponseDto };

export async function getStatistics(): Promise<StatisticsResponseDto> {
  return apiClient.get<StatisticsResponseDto>("/api/statistics");
}

export const statisticsApi = {
  getStatistics,
};

export default statisticsApi;
