export interface ResponseTimeStats {
  averageFirstResponse: number; // minutos
  averageResolution: number; // minutos
  fastestResponse: number;
  slowestResponse: number;
  totalClosedReports: number;
}

export interface ReportsByType {
  type: string;
  count: number;
  percentage: number;
}

export interface FirefighterPerformance {
  userId: number;
  username: string;
  reportsClosed: number;
  averageResolutionTime: number; // minutos
}

export interface DashboardStats {
  totalClosed: number;
  averageResponseTime: number; // minutos
  averageResolutionTime: number; // minutos
  reportsByType: ReportsByType[];
}