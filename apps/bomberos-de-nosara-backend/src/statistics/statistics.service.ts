import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EmergencyReport, ReportStatus } from '../mobile/emergency-reports/entities/emergency-report.entity';
import { StatisticsFiltersDto } from './dto/statistics-filters.dto';
import {
  ResponseTimeStats,
  ReportsByType,
  FirefighterPerformance,
  DashboardStats,
} from './interfaces/statistics.interface';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(EmergencyReport)
    private reportsRepo: Repository<EmergencyReport>,
  ) {}

  async getResponseTimeStats(filters: StatisticsFiltersDto): Promise<ResponseTimeStats> {
    const whereClause = this.buildWhereClause(filters);

    const reports = await this.reportsRepo.find({
      where: { ...whereClause, status: ReportStatus.CLOSED },
      select: ['createdAt', 'firstResponseAt', 'resolvedAt'],
    });

    if (reports.length === 0) {
      return {
        averageFirstResponse: 0,
        averageResolution: 0,
        fastestResponse: 0,
        slowestResponse: 0,
        totalClosedReports: 0,
      };
    }

    const responseTimes = reports
      .filter(r => r.firstResponseAt)
      .map(r => this.getMinutesDiff(r.createdAt, r.firstResponseAt!));

    const resolutionTimes = reports
      .filter(r => r.resolvedAt)
      .map(r => this.getMinutesDiff(r.createdAt, r.resolvedAt!));

    return {
      averageFirstResponse: this.average(responseTimes),
      averageResolution: this.average(resolutionTimes),
      fastestResponse: Math.min(...responseTimes),
      slowestResponse: Math.max(...responseTimes),
      totalClosedReports: reports.length,
    };
  }

  async getReportsByType(filters: StatisticsFiltersDto): Promise<ReportsByType[]> {
    const whereClause = this.buildWhereClause(filters);

    const results = await this.reportsRepo
      .createQueryBuilder('report')
      .select('report.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where({ ...whereClause, status: ReportStatus.CLOSED })
      .groupBy('report.type')
      .getRawMany();

    const total = results.reduce((sum, r) => sum + parseInt(r.count), 0);

    return results.map(r => ({
      type: r.type,
      count: parseInt(r.count),
      percentage: total > 0 ? (parseInt(r.count) / total) * 100 : 0,
    }));
  }

  async getFirefighterPerformance(filters: StatisticsFiltersDto): Promise<FirefighterPerformance[]> {
    const whereClause = this.buildWhereClause(filters);

    const results = await this.reportsRepo
      .createQueryBuilder('report')
      .leftJoin('report.closedByUser', 'user')
      .select('user.id', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('COUNT(*)', 'reportsClosed')
      .addSelect(
        'AVG(TIMESTAMPDIFF(MINUTE, report.createdAt, report.resolvedAt))',
        'averageResolutionTime',
      )
      .where({ ...whereClause, status: ReportStatus.CLOSED })
      .andWhere('report.closedBy IS NOT NULL')
      .groupBy('user.id')
      .getRawMany();

    return results.map(r => ({
      userId: r.userId,
      username: r.username,
      reportsClosed: parseInt(r.reportsClosed),
      averageResolutionTime: parseFloat(r.averageResolutionTime) || 0,
    }));
  }

  async getDashboardStats(filters: StatisticsFiltersDto): Promise<DashboardStats> {
    const [responseTimeStats, reportsByType] = await Promise.all([
      this.getResponseTimeStats(filters),
      this.getReportsByType(filters),
    ]);

    return {
      totalClosed: responseTimeStats.totalClosedReports,
      averageResponseTime: responseTimeStats.averageFirstResponse,
      averageResolutionTime: responseTimeStats.averageResolution,
      reportsByType,
    };
  }

  private buildWhereClause(filters: StatisticsFiltersDto) {
    const where: any = {};

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return where;
  }

  private getMinutesDiff(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / 60000);
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
  }
}