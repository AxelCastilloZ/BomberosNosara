import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception;

    const isDevelopment = process.env.NODE_ENV !== 'production';

    // LOG COMPLETO EN DESARROLLO
    if (isDevelopment) {
      this.logger.error('\n========== ERROR CAPTURADO ==========');
      this.logger.error(`URL: ${request.method} ${request.url}`);
      this.logger.error(`Status: ${status}`);
      this.logger.error('Body:', JSON.stringify(request.body, null, 2));
      this.logger.error('User:', (request as any).user);
      this.logger.error('Exception:', exception);
      if (exception instanceof Error) {
        this.logger.error('Stack:', exception.stack);
      }
      this.logger.error('=====================================\n');
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: isDevelopment
        ? message
        : status === 500
        ? 'Error interno del servidor'
        : message,
      ...(isDevelopment && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(status).json(errorResponse);
  }
}