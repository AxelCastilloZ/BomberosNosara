import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportMinDto } from './dto/create-report-min.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportStatus } from './enums/report-status.enum';
import { WebSocketsService } from '../web-sockets/web-sockets.service';
import { WebSocketEvents } from '../web-sockets/events';

@Injectable()
export class AppMobileService {
  constructor(
    @InjectRepository(Report) private readonly repo: Repository<Report>,
    private readonly ws: WebSocketsService,
  ) {}

  // Público: crear reporte (tipo + ubicación)
  async createReport(dto: CreateReportMinDto) {
    const entity = this.repo.create({
      type: dto.type,
      lat: dto.lat,
      lng: dto.lng,
      status: ReportStatus.PENDING,
    });
    const saved = await this.repo.save(entity);

    // Emitir a todos (app pública + panel)
    this.ws.emit(WebSocketEvents.REPORT_CREATED, this.toPayload(saved));
    return saved;
  }

  // Público: listar reportes (para mapa/lista)
  listReports() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  // Bomberos: cambiar estado
  async updateReportStatus(id: string, dto: UpdateReportStatusDto) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Reporte no existe');
    r.status = dto.status;
    const saved = await this.repo.save(r);

    this.ws.emit(WebSocketEvents.REPORT_UPDATED, this.toPayload(saved));
    return saved;
  }

  // Mapper para payload de WS
  private toPayload(r: Report) {
    return {
      id: r.id,
      type: r.type,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      location: { lat: Number(r.lat), lng: Number(r.lng) },
    };
  }
}
