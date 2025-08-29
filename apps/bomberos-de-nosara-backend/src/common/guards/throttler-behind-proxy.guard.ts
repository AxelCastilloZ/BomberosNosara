// src/common/guards/throttler-behind-proxy.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // si confías en el proxy, Express llenará req.ips
    return Array.isArray(req.ips) && req.ips.length ? req.ips[0] : req.ip;
  }
}
