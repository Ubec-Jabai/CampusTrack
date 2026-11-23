export interface StatisticsResponseDto {
  buildings: number;
  rooms: number;
  assets: number;
  incidents: number;
  users: number;
}

export interface WorkerStatisticsResponseDto {
  assigned: number;
  forInspection: number;
  pendingReview: number;
  approved: number;
  resolved: number;
  rejected: number;
}
