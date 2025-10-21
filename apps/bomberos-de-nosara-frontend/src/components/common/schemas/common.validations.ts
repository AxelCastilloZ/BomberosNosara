// src/components/common/schemas/common.validations.ts
import { z } from 'zod';

/**
 * Validaciones comunes reutilizables para TODOS los módulos
 * 
 * Solo agrega aquí validaciones genéricas que cualquier módulo pueda necesitar.
 * Para validaciones específicas de un módulo, créalas en su propio archivo.
 */

// Strings genéricos
export const email = z.string().email('El correo debe tener un formato válido');

export const url = z.string()
  .url('Debe ser una URL válida')
  .or(z.literal('')); // Permite string vacío

export const phone = z.string()
  .regex(/^\d{8}$/, 'El teléfono debe tener 8 dígitos');

// Números genéricos
export const positiveInt = z.number()
  .int('Debe ser un número entero')
  .nonnegative('No puede ser negativo');

export const positiveNumber = z.number()
  .nonnegative('No puede ser negativo');

// Fechas genéricas
export const dateNotFuture = z.string().refine(
  (date) => new Date(date) <= new Date(),
  'La fecha no puede ser futura'
);

export const dateNotPast = z.string().refine(
  (date) => new Date(date) >= new Date(),
  'La fecha no puede ser pasada'
);