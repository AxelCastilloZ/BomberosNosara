// src/modules/inventarioVehiculos/utils/vehiculoValidations.ts

import { z } from 'zod';
import { EstadoVehiculo, TipoVehiculo } from '../../../types/vehiculo.types';
import { TipoMantenimiento } from '../../../types/mantenimiento.types';

// ==================== HELPERS ESPECÍFICOS ====================

const nonEmptyString = (fieldName: string, min = 1, max = 500) =>
  z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) => val.length >= min,
      `${fieldName} es obligatorio y no puede contener solo espacios`
    )
    .refine(
      (val) => val.length <= max,
      `${fieldName} no puede superar ${max} caracteres`
    );

const kilometraje = z
  .number()
  .int('Debe ser un número entero, sin decimales')
  .min(0, 'El kilometraje no puede ser negativo')
  .max(9999999, 'El kilometraje no puede superar 9,999,999 km');

const costo = z
  .number()
  .min(0, 'El costo no puede ser negativo')
  .max(99999999.99, 'El costo es demasiado alto');

const placa = z
  .string()
  .transform((val) => val.trim())
  .refine(
    (val) => val.length > 0,
    'La placa es obligatoria y no puede contener solo espacios'
  )
  .refine((val) => val.length >= 3, 'La placa debe tener al menos 3 caracteres')
  .refine((val) => val.length <= 50, 'La placa no puede superar 50 caracteres');

// ✅ MEJORADO: Mensajes claros para enums
const estadoInicialSchema = z
  .enum(['nuevo', 'usado'], {
    errorMap: () => ({ message: 'Selecciona un estado inicial' }),
  });

const tipoVehiculoSchema = z
  .nativeEnum(TipoVehiculo, {
    errorMap: () => ({ message: 'Selecciona un tipo de vehículo' }),
  });

const estadoVehiculoSchema = z
  .nativeEnum(EstadoVehiculo, {
    errorMap: () => ({ message: 'Selecciona un estado actual' }),
  });

const tipoMantenimientoSchema = z
  .nativeEnum(TipoMantenimiento, {
    errorMap: () => ({ message: 'Selecciona un tipo de mantenimiento' }),
  });

// ✅ NUEVO: Validación para fecha futura (mínimo mañana)
const dateFuture = z.string().refine(
  (date) => {
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate >= tomorrow;
  },
  'La fecha debe ser mínimo mañana'
);

// ✅ NUEVO: Validación para fecha pasada o presente (máximo hoy)
const dateNotFuture = z.string().refine(
  (date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate <= today;
  },
  'La fecha no puede ser futura'
);

// ==================== SCHEMAS DE VEHÍCULOS ====================

export const createVehiculoSchema = z.object({
  placa,
  tipo: tipoVehiculoSchema,
  estadoInicial: estadoInicialSchema,
  estadoActual: estadoVehiculoSchema,
  fechaAdquisicion: dateNotFuture,
  kilometraje,
  observaciones: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || val.length <= 500,
      'Las observaciones no pueden superar 500 caracteres'
    ),
});

export const editVehiculoSchema = z
  .object({
    placa: placa.optional(),
    tipo: tipoVehiculoSchema.optional(),
    fechaAdquisicion: dateNotFuture.optional(),
    kilometraje: kilometraje.optional(),
    estadoActual: estadoVehiculoSchema.optional(),
    observaciones: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => val?.trim() || undefined)
      .refine(
        (val) => !val || val.length <= 500,
        'Las observaciones no pueden superar 500 caracteres'
      ),
    observacionesProblema: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => val?.trim() || undefined),
    motivoBaja: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => {
      if (data.estadoActual === EstadoVehiculo.MALO) {
        return data.observacionesProblema && data.observacionesProblema.length >= 10;
      }
      return true;
    },
    {
      message: 'Describe el problema del vehículo (mínimo 10 caracteres)',
      path: ['observacionesProblema'],
    }
  )
  .refine(
    (data) => {
      if (data.estadoActual === EstadoVehiculo.BAJA) {
        return data.motivoBaja && data.motivoBaja.length >= 5;
      }
      return true;
    },
    {
      message: 'Especifica el motivo de la baja (mínimo 5 caracteres)',
      path: ['motivoBaja'],
    }
  );

export const updateEstadoSchema = z
  .object({
    estadoActual: estadoVehiculoSchema,
    observaciones: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => val?.trim() || undefined),
    observacionesProblema: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => val?.trim() || undefined),
    motivoBaja: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => {
      if (data.estadoActual === EstadoVehiculo.MALO) {
        return data.observacionesProblema && data.observacionesProblema.length >= 10;
      }
      return true;
    },
    {
      message: 'Describe el problema del vehículo (mínimo 10 caracteres)',
      path: ['observacionesProblema'],
    }
  )
  .refine(
    (data) => {
      if (data.estadoActual === EstadoVehiculo.BAJA) {
        return data.motivoBaja && data.motivoBaja.length >= 5;
      }
      return true;
    },
    {
      message: 'Especifica el motivo de la baja (mínimo 5 caracteres)',
      path: ['motivoBaja'],
    }
  );

// ==================== SCHEMAS DE MANTENIMIENTOS ====================

export const programarMantenimientoSchema = z.object({
  vehiculoId: z.string().min(1, 'Debes seleccionar un vehículo'),
  tipo: tipoMantenimientoSchema,
  fecha: dateFuture,
  descripcion: nonEmptyString('La descripción', 5, 250),
  observaciones: z.string().default('').transform(val => val.trim() || undefined),
});

export const registrarMantenimientoSchema = z.object({
  vehiculoId: z.string().min(1, 'Debes seleccionar un vehículo'),
  tipo: tipoMantenimientoSchema,
  fecha: dateNotFuture,
  descripcion: nonEmptyString('La descripción', 5, 250),
  kilometraje,
  tecnico: nonEmptyString('El nombre del técnico', 3, 100),
  costo,
  observaciones: z
    .string()
    .default('')
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || val.length <= 300,
      'Las observaciones no pueden superar 300 caracteres'
    ),
});

export const completarMantenimientoSchema = z.object({
  kilometraje,
  tecnico: nonEmptyString('El nombre del técnico', 3, 100),
  costo,
  observaciones: z
    .string()
    .default('')
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || val.length <= 300,
      'Las observaciones no pueden superar 300 caracteres'
    ),
});

// ==================== TYPES ====================

export type CreateVehiculoFormData = z.infer<typeof createVehiculoSchema>;
export type EditVehiculoFormData = z.infer<typeof editVehiculoSchema>;
export type UpdateEstadoFormData = z.infer<typeof updateEstadoSchema>;
export type ProgramarMantenimientoFormData = z.infer<typeof programarMantenimientoSchema>;
export type RegistrarMantenimientoFormData = z.infer<typeof registrarMantenimientoSchema>;
export type CompletarMantenimientoFormData = z.infer<typeof completarMantenimientoSchema>;

// ==================== CONSTANTES ====================

export const VEHICULO_FIELD_LIMITS = {
  placa: 50,
  observaciones: 500,
  observacionesProblema: 500,
  motivoBaja: 500,
  descripcion: 250,
  tecnico: 100,
  kilometraje: 9999999,
  costo: 99999999.99,
  // ✅ Límite para observaciones en modales de mantenimiento (Completar y Registrar)
  observacionesMantenimiento: 300,
} as const;