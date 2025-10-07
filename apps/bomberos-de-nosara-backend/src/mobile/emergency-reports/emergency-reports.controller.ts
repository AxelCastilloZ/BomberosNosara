import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmergencyReportsService } from './emergency-reports.service';
import {
  CreateEmergencyReportDto,
  UpdateReportStatusDto,
  CompleteReportDto,
  AddInvolvedPersonDto,
  CreateAttachmentDto,
} from './dto/emergency-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleEnum } from '../../roles/role.enum';

@Controller('emergency-reports')
export class EmergencyReportsController {
  constructor(private readonly reportsService: EmergencyReportsService) {}

  @Get('active')
  findActive() {
    return this.reportsService.findActive();
  }

  @Get(':id/public')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createDto: CreateEmergencyReportDto,
    @GetUser('sub') mobileUserId: number,
  ) {
    return this.reportsService.create(createDto, mobileUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-reports')
  findMyReports(@GetUser('sub') mobileUserId: number) {
    return this.reportsService.findByMobileUser(mobileUserId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PERSONAL_BOMBERIL, RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  @Get(':id/complete')
  findOneComplete(@Param('id') id: string) {
    return this.reportsService.findOneComplete(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PERSONAL_BOMBERIL, RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateReportStatusDto,
    @GetUser('sub') userId: number,
  ) {
    return this.reportsService.updateStatus(+id, updateDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PERSONAL_BOMBERIL, RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  @Post(':id/complete-and-close')
  completeAndClose(
    @Param('id') id: string,
    @Body() completeDto: CompleteReportDto,
    @GetUser('sub') userId: number,
  ) {
    return this.reportsService.completeAndClose(+id, completeDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PERSONAL_BOMBERIL, RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  @Post(':id/involved-persons')
  addInvolvedPerson(
    @Param('id') id: string,
    @Body() personDto: AddInvolvedPersonDto,
  ) {
    return this.reportsService.addInvolvedPerson(+id, personDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PERSONAL_BOMBERIL, RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  @Post(':id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Body() attachmentDto: CreateAttachmentDto,
  ) {
    return this.reportsService.addAttachment(+id, attachmentDto);
  }
}