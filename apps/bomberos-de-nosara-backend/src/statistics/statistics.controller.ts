import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsFiltersDto } from './dto/statistics-filters.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.PERSONAL_BOMBERIL, RoleEnum.ADMIN, RoleEnum.SUPERUSER)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  getDashboard(@Query() filters: StatisticsFiltersDto) {
    return this.statisticsService.getDashboardStats(filters);
  }

  @Get('response-times')
  getResponseTimes(@Query() filters: StatisticsFiltersDto) {
    return this.statisticsService.getResponseTimeStats(filters);
  }

  @Get('reports-by-type')
  getReportsByType(@Query() filters: StatisticsFiltersDto) {
    return this.statisticsService.getReportsByType(filters);
  }

  @Get('firefighter-performance')
  getFirefighterPerformance(@Query() filters: StatisticsFiltersDto) {
    return this.statisticsService.getFirefighterPerformance(filters);
  }
}