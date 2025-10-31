


// src/modules/inventarioEquipos/utils/equipoBomberilValidations.ts

import { z } from 'zod';
import { EstadoEquipo, TipoEquipo } from '../../../types/equipoBomberil.types';
import { TipoMantenimiento } from '../../../types/mantenimientoEquipo.types';

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

const costo = z
  .number()
  .min(0, 'El costo no puede ser negativo')
  .max(99999999.99, 'El costo es demasiado alto');

const numeroSerie = z
  .string()
  .transform((val) => val.trim())
  .refine(
    (val) => val.length > 0,
    'El número de serie es obligatorio y no puede contener solo espacios'
  )
  .refine((val) => val.length >= 3, 'El número de serie debe tener al menos 3 caracteres')
  .refine((val) => val.length <= 100, 'El número de serie no puede superar 100 caracteres');

const nombre = z
  .string()
  .transform((val) => val.trim())
  .refine(
    (val) => val.length > 0,
    'El nombre es obligatorio y no puede contener solo espacios'
  )
  .refine((val) => val.length >= 3, 'El nombre debe tener al menos 3 caracteres')
  .refine((val) => val.length <= 100, 'El nombre no puede superar 100 caracteres');

// ✅ Mensajes claros para enums
const estadoInicialSchema = z
  .enum(['nuevo', 'usado'], {
    errorMap: () => ({ message: 'Selecciona un estado inicial' }),
  });

const tipoEquipoSchema = z
  .nativeEnum(TipoEquipo, {
    errorMap: () => ({ message: 'Selecciona un tipo de equipo' }),
  });

const estadoEquipoSchema = z
  .nativeEnum(EstadoEquipo, {
    errorMap: () => ({ message: 'Selecciona un estado actual' }),
  });

const tipoMantenimientoSchema = z
  .nativeEnum(TipoMantenimiento, {
    errorMap: () => ({ message: 'Selecciona un tipo de mantenimiento' }),
  });

// ✅ Validación para fecha futura (mínimo mañana)
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

// ✅ Validación para fecha pasada o presente (máximo hoy)
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

// ==================== SCHEMAS DE EQUIPOS ====================

export const createEquipoSchema = z.object({
  numeroSerie,
  nombre,
  tipo: tipoEquipoSchema,
  estadoInicial: estadoInicialSchema,
  estadoActual: estadoEquipoSchema,
  fechaAdquisicion: dateNotFuture,
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

export const editEquipoSchema = z
  .object({
    numeroSerie: numeroSerie.optional(),
    nombre: nombre.optional(),
    tipo: tipoEquipoSchema.optional(),
    fechaAdquisicion: dateNotFuture.optional(),
    estadoActual: estadoEquipoSchema.optional(),
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
      if (data.estadoActual === EstadoEquipo.MALO) {
        return data.observacionesProblema && data.observacionesProblema.length >= 10;
      }
      return true;
    },
    {
      message: 'Describe el problema del equipo (mínimo 10 caracteres)',
      path: ['observacionesProblema'],
    }
  )
  .refine(
    (data) => {
      if (data.estadoActual === EstadoEquipo.BAJA) {
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
    estadoActual: estadoEquipoSchema,
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
      if (data.estadoActual === EstadoEquipo.MALO) {
        return data.observacionesProblema && data.observacionesProblema.length >= 10;
      }
      return true;
    },
    {
      message: 'Describe el problema del equipo (mínimo 10 caracteres)',
      path: ['observacionesProblema'],
    }
  )
  .refine(
    (data) => {
      if (data.estadoActual === EstadoEquipo.BAJA) {
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
  equipoId: z.string().min(1, 'Debes seleccionar un equipo'),
  tipo: tipoMantenimientoSchema,
  fecha: dateFuture,
  descripcion: nonEmptyString('La descripción', 5, 250),
  observaciones: z.string().default('').transform(val => val.trim() || undefined),
});

export const registrarMantenimientoSchema = z.object({
  equipoId: z.string().min(1, 'Debes seleccionar un equipo'),
  tipo: tipoMantenimientoSchema,
  fecha: dateNotFuture,
  descripcion: nonEmptyString('La descripción', 5, 250),
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

export type CreateEquipoFormData = z.infer<typeof createEquipoSchema>;
export type EditEquipoFormData = z.infer<typeof editEquipoSchema>;
export type UpdateEstadoFormData = z.infer<typeof updateEstadoSchema>;
export type ProgramarMantenimientoFormData = z.infer<typeof programarMantenimientoSchema>;
export type RegistrarMantenimientoFormData = z.infer<typeof registrarMantenimientoSchema>;
export type CompletarMantenimientoFormData = z.infer<typeof completarMantenimientoSchema>;

// ==================== CONSTANTES ====================

export const EQUIPO_FIELD_LIMITS = {
  numeroSerie: 100,
  nombre: 100,
  observaciones: 500,
  observacionesProblema: 500,
  motivoBaja: 500,
  descripcion: 250,
  tecnico: 100,
  costo: 99999999.99,
  // ✅ Límite para observaciones en modales de mantenimiento (Completar y Registrar)
  observacionesMantenimiento: 300,
} as const;