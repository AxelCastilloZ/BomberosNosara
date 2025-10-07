import {
  ResponseTimeStats,
  ReportsByType,
  FirefighterPerformance,
  DashboardStats,
} from '../interfaces/statistics.interface';

export class ResponseTimeStatsDto implements ResponseTimeStats {
  averageFirstResponse: number;
  averageResolution: number;
  fastestResponse: number;
  slowestResponse: number;
  totalClosedReports: number;
}

export class ReportsByTypeDto implements ReportsByType {
  type: string;
  count: number;
  percentage: number;
}

export class FirefighterPerformanceDto implements FirefighterPerformance {
  userId: number;
  username: string;
  reportsClosed: number;
  averageResolutionTime: number;
}

export class DashboardStatsDto implements DashboardStats {
  totalClosed: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  reportsByType: ReportsByTypeDto[];
}