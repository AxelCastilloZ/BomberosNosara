import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppMobileService } from './app-mobile.service';
import { CreateReportMinDto } from './dto/create-report-min.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Controller('app-mobile')
export class AppMobileController {
  constructor(private readonly service: AppMobileService) {}

  
  @Post('reports')
  create(@Body() dto: CreateReportMinDto) {
    return this.service.createReport(dto);
  }


  @Get('reports')
  list() {
    return this.service.listReports();
  }

  
  @Patch('reports/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReportStatusDto) {
    return this.service.updateReportStatus(id, dto);
  }
}
