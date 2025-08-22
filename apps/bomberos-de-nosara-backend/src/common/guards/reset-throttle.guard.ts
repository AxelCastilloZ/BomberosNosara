
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

function getClientIp(req: any): string {
  if (Array.isArray(req.ips) && req.ips.length) return String(req.ips[0]);
  const xff = req.headers?.['x-forwarded-for'];
  if (Array.isArray(xff)) return (xff[0] || '').trim();
  if (typeof xff === 'string') return (xff.split(',')[0] || '').trim();
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

@Injectable()
export class ResetThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = getClientIp(req);
    const emailOrUser = String(req.body?.email ?? req.body?.username ?? '')
      .toLowerCase()
      .trim();
    return `reset:${ip}:${emailOrUser || 'no-id'}`;
  }
}
