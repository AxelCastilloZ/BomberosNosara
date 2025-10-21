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
export class LoginThrottleGuard extends ThrottlerGuard {
  
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = getClientIp(req);
    const username = String(req.body?.username ?? '')
      .toLowerCase()
      .trim();
    return `login:${ip}:${username || 'no-username'}`;
  }
}
