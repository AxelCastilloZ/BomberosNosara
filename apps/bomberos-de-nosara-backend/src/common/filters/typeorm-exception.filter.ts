// src/common/filters/typeorm-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError & { driverError?: any }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const d = exception.driverError ?? {};

    // --- DUPLICATE KEY (MySQL/MariaDB) ---
    if (d?.errno === 1062 || d?.code === 'ER_DUP_ENTRY') {
      const field = this.extractFieldFromMySql(d);
      const value = this.extractValueFromError(d?.sqlMessage);
      const message = this.buildDuplicateMessage(field, value);

      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        code: 'DUPLICATE_KEY',
        field,
        value,
        message,
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

    // --- INCORRECT VALUE ---
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

    // --- DEADLOCK / LOCK TIMEOUT ---
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

  // Extrae el valor duplicado del mensaje de error
  private extractValueFromError(sqlMessage?: string): string | undefined {
    if (!sqlMessage) return undefined;
    
    // Ejemplo: "Duplicate entry 'g55' for key 'vehiculos.IDX_...'"
    const match = sqlMessage.match(/Duplicate entry '([^']+)'/);
    return match?.[1];
  }

  // Construye un mensaje específico según el campo
  private buildDuplicateMessage(field?: string, value?: string): string {
    const displayValue = value ? ` '${value.toUpperCase()}'` : '';
    
    switch (field) {
      case 'placa':
        return value 
          ? `La placa${displayValue} ya está registrada. Use una placa diferente.`
          : 'Esta placa ya está registrada. Use una placa diferente.';
      
      case 'email':
        return value
          ? `El correo${displayValue} ya está en uso. Use un correo diferente.`
          : 'Este correo ya está en uso. Use un correo diferente.';
      
      case 'codigo':
        return value
          ? `El código${displayValue} ya existe. Use un código diferente.`
          : 'Este código ya existe. Use un código diferente.';
      
      case 'serial':
        return value
          ? `El número de serie${displayValue} ya está registrado. Use uno diferente.`
          : 'Este número de serie ya está registrado. Use uno diferente.';
      
      default:
        return value
          ? `El valor${displayValue} ya existe en este campo. Use uno diferente.`
          : 'Este valor ya existe. Use uno diferente.';
    }
  }

  // Intenta extraer un "campo" a partir del constraint name y del SQL query
  private extractFieldFromMySql(d: any): string | undefined {
    const msg: string = d?.sqlMessage || '';
    const sql: string = d?.sql || '';

    // Primero intenta con el constraint name
    const m1 = msg.match(/for key '.*\.(\w+)'/);
    if (m1?.[1]) {
      const normalized = this.normalizeConstraintName(m1[1]);
      if (normalized) return normalized;
    }

    const m2 = msg.match(/for key '(\w+)'/);
    if (m2?.[1]) {
      const normalized = this.normalizeConstraintName(m2[1]);
      if (normalized) return normalized;
    }

    // Si no encuentra en el constraint, busca en el SQL query
    if (sql.toLowerCase().includes('`placa`')) return 'placa';
    if (sql.toLowerCase().includes('`email`')) return 'email';
    if (sql.toLowerCase().includes('`codigo`')) return 'codigo';
    if (sql.toLowerCase().includes('`serial`')) return 'serial';

    // Busca en el mensaje de error también
    if (msg.toLowerCase().includes('placa')) return 'placa';
    if (msg.toLowerCase().includes('email')) return 'email';
    if (msg.toLowerCase().includes('codigo')) return 'codigo';
    if (msg.toLowerCase().includes('serial')) return 'serial';

    return undefined;
  }

  private extractFieldFromCheck(msg?: string): string | undefined {
    if (!msg) return;
    const m = msg.match(/Check constraint '(\w+)'/i);
    if (!m?.[1]) return;
    return this.normalizeConstraintName(m[1]);
  }

  // Normaliza nombres de constraints a posibles campos
  private normalizeConstraintName(name: string): string | undefined {
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
