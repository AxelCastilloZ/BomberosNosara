import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmergencyReport,
  ReportStatus,
} from './entities/emergency-report.entity';
import { StatusChange } from './entities/status-change.entity';
import { InvolvedPerson } from './entities/involved-person.entity';
import { ReportAttachment } from './entities/report-attachment.entity';
import {
  CreateEmergencyReportDto,
  UpdateReportStatusDto,
  CompleteReportDto,
  AddInvolvedPersonDto,
  CreateAttachmentDto,
} from './dto/emergency-report.dto';

@Injectable()
export class EmergencyReportsService {
  constructor(
    @InjectRepository(EmergencyReport)
    private reportsRepo: Repository<EmergencyReport>,
    @InjectRepository(StatusChange)
    private statusChangesRepo: Repository<StatusChange>,
    @InjectRepository(InvolvedPerson)
    private involvedPersonsRepo: Repository<InvolvedPerson>,
    @InjectRepository(ReportAttachment)
    private attachmentsRepo: Repository<ReportAttachment>,
  ) {}

  async findActive(): Promise<EmergencyReport[]> {
    return await this.reportsRepo.find({
      where: [
        { status: ReportStatus.PENDING },
        { status: ReportStatus.IN_PROGRESS },
        { status: ReportStatus.RESOLVED },
      ],
      relations: ['mobileUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<EmergencyReport> {
    const report = await this.reportsRepo.findOne({
      where: { id },
      relations: ['mobileUser', 'closedByUser'],
    });

    if (!report) {
      throw new NotFoundException(`Report #${id} not found`);
    }

    return report;
  }

  async create(
    createDto: CreateEmergencyReportDto,
    mobileUserId: number,
  ): Promise<EmergencyReport> {
    const report = this.reportsRepo.create({
      ...createDto,
      mobileUserId,
      status: ReportStatus.PENDING,
    });

    return await this.reportsRepo.save(report);
  }

  async findByMobileUser(mobileUserId: number): Promise<EmergencyReport[]> {
    return await this.reportsRepo.find({
      where: { mobileUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneComplete(id: number): Promise<EmergencyReport> {
    const report = await this.reportsRepo.findOne({
      where: { id },
      relations: [
        'mobileUser',
        'closedByUser',
        'involvedPersons',
        'attachments',
        'statusChanges',
        'statusChanges.changedByUser',
      ],
      order: {
        statusChanges: { changedAt: 'ASC' },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report #${id} not found`);
    }

    return report;
  }

  async updateStatus(
    id: number,
    updateDto: UpdateReportStatusDto,
    userId: number,
  ): Promise<EmergencyReport> {
    const report = await this.findOne(id);

    this.validateStatusTransition(report.status, updateDto.status);

    const oldStatus = report.status;
    report.status = updateDto.status;

    if (
      updateDto.status === ReportStatus.IN_PROGRESS &&
      !report.firstResponseAt
    ) {
      report.firstResponseAt = new Date();
    }

    if (updateDto.status === ReportStatus.RESOLVED) {
      report.resolvedAt = new Date();
    }

    if (updateDto.status === ReportStatus.CLOSED) {
      report.closedBy = userId;
    }

    const updatedReport = await this.reportsRepo.save(report);

    await this.statusChangesRepo.save({
      emergencyReportId: id,
      fromStatus: oldStatus,
      toStatus: updateDto.status,
      changedBy: userId,
      notes: updateDto.notes,
    });

    return updatedReport;
  }

  async completeAndClose(
    id: number,
    completeDto: CompleteReportDto,
    userId: number,
  ): Promise<EmergencyReport> {
    const report = await this.findOne(id);

    if (report.status !== ReportStatus.RESOLVED) {
      throw new BadRequestException(
        'Report must be in RESOLVED status before closing',
      );
    }

    report.incidentDetails = completeDto.incidentDetails;
    report.recommendations = completeDto.recommendations || null;
    report.status = ReportStatus.CLOSED;
    report.closedBy = userId;

    const updatedReport = await this.reportsRepo.save(report);

    await this.statusChangesRepo.save({
      emergencyReportId: id,
      fromStatus: ReportStatus.RESOLVED,
      toStatus: ReportStatus.CLOSED,
      changedBy: userId,
      notes: 'Report completed and closed',
    });

    return updatedReport;
  }

  async addInvolvedPerson(
    reportId: number,
    personDto: AddInvolvedPersonDto,
  ): Promise<InvolvedPerson> {
    const report = await this.findOne(reportId);

    if (report.status === ReportStatus.CLOSED) {
      throw new BadRequestException('Cannot modify closed report');
    }

    const person = this.involvedPersonsRepo.create({
      ...personDto,
      emergencyReportId: reportId,
    });

    return await this.involvedPersonsRepo.save(person);
  }

  async addAttachment(
    reportId: number,
    attachmentDto: CreateAttachmentDto,
  ): Promise<ReportAttachment> {
    const report = await this.findOne(reportId);

    if (report.status === ReportStatus.CLOSED) {
      throw new BadRequestException('Cannot modify closed report');
    }

    const attachment = this.attachmentsRepo.create({
      ...attachmentDto,
      emergencyReportId: reportId,
    });

    return await this.attachmentsRepo.save(attachment);
  }

  private validateStatusTransition(
    currentStatus: ReportStatus,
    newStatus: ReportStatus,
  ): void {
   const validTransitions: Record<ReportStatus, ReportStatus[]> = {
  [ReportStatus.PENDING]: [ReportStatus.IN_PROGRESS],
  [ReportStatus.IN_PROGRESS]: [ReportStatus.RESOLVED],
  [ReportStatus.RESOLVED]: [ReportStatus.CLOSED],
  [ReportStatus.CLOSED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}