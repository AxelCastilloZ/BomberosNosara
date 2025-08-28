// src/common/filters/typeorm-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError & { driverError?: any }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    // En TypeORM >= 0.3 los detalles de MySQL vienen en driverError
    const d = exception.driverError ?? {};

    // --- DUPLICATE KEY (MySQL/MariaDB) ---
    if (d?.errno === 1062 || d?.code === 'ER_DUP_ENTRY') {
      const field = this.extractFieldFromMySql(d); // puede ser undefined
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        code: 'DUPLICATE_KEY',
        field, // si no se logra inferir, no se envía o queda undefined
        message: 'Ya existe un registro con el mismo valor en un campo único.',
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- NOT NULL VIOLATION ---
    if (d?.errno === 1048) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'NOT_NULL_VIOLATION',
        message: 'Falta un campo requerido.',
        detail: d?.sqlMessage,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- FOREIGN KEY VIOLATION ---
    if (d?.errno === 1452) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'La referencia indicada no es válida.',
        detail: d?.sqlMessage,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- CHECK CONSTRAINT (MySQL 8+) ---
    if (d?.errno === 3819) {
      const field = this.extractFieldFromCheck(d?.sqlMessage);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'CHECK_CONSTRAINT_VIOLATION',
        field,
        message: 'La validación definida para el campo no se cumple.',
        detail: d?.sqlMessage,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- DATA TOO LONG ---
    if (d?.errno === 1406) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'DATA_TOO_LONG',
        message: 'El valor excede el tamaño permitido.',
        detail: d?.sqlMessage,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }


    if (d?.errno === 1366) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INCORRECT_VALUE',
        message: 'El valor proporcionado no es válido para el tipo de dato.',
        detail: d?.sqlMessage,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- DEADLOCK / LOCK TIMEOUT (opcional, útil en concurrencia) ---
    if (d?.errno === 1213 || d?.errno === 1205) {
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        code: d?.errno === 1213 ? 'DEADLOCK' : 'LOCK_TIMEOUT',
        message: 'Conflicto de concurrencia. Intenta nuevamente.',
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- Fallback genérico ---
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }

  // Intenta extraer un "campo" a partir del nombre de la constraint en MySQL
  private extractFieldFromMySql(d: any): string | undefined {
    const msg: string = d?.sqlMessage || '';


    const m1 = msg.match(/for key '.*\.(\w+)'/);
    if (m1?.[1]) return this.normalizeConstraintName(m1[1]);

 
    const m2 = msg.match(/for key '(\w+)'/);
    if (m2?.[1]) return this.normalizeConstraintName(m2[1]);

    return undefined;
  }

  private extractFieldFromCheck(msg?: string): string | undefined {
    if (!msg) return;
    const m = msg.match(/Check constraint '(\w+)'/i);
    if (!m?.[1]) return;
    return this.normalizeConstraintName(m[1]);
  }

  // Normaliza nombres de constraints a posibles campos; mantiene genérico
  private normalizeConstraintName(name: string) {
    const n = name.toLowerCase();
    if (n.includes('placa')) return 'placa';
    if (n.includes('codigo')) return 'codigo';
    if (n.includes('serial')) return 'serial';
    if (n.includes('stock')) return 'stock';
    if (n.includes('cantidad')) return 'cantidad';
    if (n.includes('email')) return 'email';
 
    return undefined;
  }
}
