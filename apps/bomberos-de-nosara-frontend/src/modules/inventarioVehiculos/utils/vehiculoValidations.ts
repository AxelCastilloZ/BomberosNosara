import { z } from 'zod';
import { dateNotFuture, dateNotPast } from '../../../components/common/schemas/common.validations';
import { EstadoVehiculo, TipoVehiculo } from '../../../types/vehiculo.types';

// ==================== HELPERS ESPECÍFICOS DE VEHÍCULOS ====================

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

// ✅ FIX: SIN coerce - usar valueAsNumber en el input
const kilometraje = z
  .number()
  .int('Debe ser un número entero, sin decimales')
  .min(0, 'El kilometraje no puede ser negativo')
  .max(9999999, 'El kilometraje no puede superar 9,999,999 km');
// ✅ FIX: SIN coerce - usar valueAsNumber en el input
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

// ✅ FIX: SIN cast - deja que Zod infiera el tipo correctamente
const estadoInicialSchema = z.enum(['nuevo', 'usado']);

// ==================== SCHEMAS DE VEHÍCULOS ====================

export const createVehiculoSchema = z.object({
  placa,

  tipo: z.nativeEnum(TipoVehiculo),

  estadoInicial: estadoInicialSchema,

  estadoActual: z.nativeEnum(EstadoVehiculo),

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

    tipo: z.nativeEnum(TipoVehiculo).optional(),

    fechaAdquisicion: dateNotFuture.optional(),

    kilometraje: kilometraje.optional(),

    estadoActual: z.nativeEnum(EstadoVehiculo).optional(),

    observaciones: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => val?.trim() || undefined)
      .refine(
        (val) => !val || val.length <= 500,
        'Las observaciones no pueden superar 500 caracteres'
      ),

    // Campos condicionales
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
      // Si estadoActual es MALO, observacionesProblema es obligatorio
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
      // Si estadoActual es BAJA, motivoBaja es obligatorio
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
    estadoActual: z.nativeEnum(EstadoVehiculo),

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
  fecha: dateNotPast,

  descripcion: nonEmptyString('La descripción', 5, 500),

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

export const registrarMantenimientoSchema = z.object({
  fecha: dateNotFuture,

  descripcion: nonEmptyString('La descripción', 5, 500),

  kilometraje,

  tecnico: nonEmptyString('El nombre del técnico', 3, 200),

  costo,

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

export const completarMantenimientoSchema = z.object({
  kilometraje,

  tecnico: nonEmptyString('El nombre del técnico', 3, 200),

  costo,

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
  descripcion: 500,
  tecnico: 200,
  kilometraje: 9999999,
  costo: 99999999.99,
} as const;