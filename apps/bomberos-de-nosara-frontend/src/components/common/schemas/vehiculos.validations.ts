// src/components/common/schemas/vehiculos.validations.ts
import { z } from 'zod';

// Helper: String que no permite solo espacios en blanco
const nonEmptyString = (fieldName: string, min = 1, max = 500) => 
  z.string()
    .transform(val => val.trim()) // Elimina espacios al inicio y final
    .refine(
      val => val.length >= min,
      `${fieldName} es obligatorio y no puede contener solo espacios`
    )
    .refine(
      val => val.length <= max,
      `${fieldName} no puede superar ${max} caracteres`
    );

// Validación específica para kilometraje de vehículos
const kilometraje = z.coerce
  .number()
  .int('Debe ser un número entero, sin decimales')
  .min(0, 'El kilometraje no puede ser negativo')
  .max(999999, 'El kilometraje no puede superar 999,999 km');

export const vehiculoCreateSchema = z.object({
  placa: z.string()
    .transform(val => val.trim())
    .refine(
      val => val.length > 0,
      'La placa es obligatoria y no puede contener solo espacios'
    )
    .refine(
      val => val.length >= 3,
      'La placa debe tener al menos 3 caracteres'
    )
    .refine(
      val => val.length <= 50,
      'La placa no puede superar 50 caracteres'
    ),

  tipo: z.string()
    .min(1, 'Debe seleccionar un tipo de vehículo')
    .refine(
      (val) => [
        'camión sisterna',
        'carro ambulancia',
        'pickup utilitario',
        'moto',
        'atv',
        'jet ski',
        'lancha rescate',
        'dron reconocimiento'
      ].includes(val),
      'Tipo de vehículo inválido'
    ),

  estadoInicial: z.string()
    .min(1, 'Debe seleccionar el estado inicial')
    .refine(
      (val) => ['nuevo', 'usado'].includes(val),
      'Estado inicial inválido'
    ),

  estadoActual: z.string()
    .min(1, 'Debe seleccionar el estado actual del vehículo')
    .refine(
      (val) => ['en servicio', 'malo', 'fuera de servicio', 'dado de baja'].includes(val),
      'Estado actual inválido'
    ),

  fechaAdquisicion: z.string()
    .min(1, 'La fecha de adquisición es obligatoria')
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate <= today;
      },
      'La fecha de adquisición no puede ser futura'
    ),
  
  kilometraje: kilometraje,

  fotoUrl: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || '')
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      'Debe ser una URL válida'
    ),

  observaciones: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || '')
    .refine(
      (val) => !val || val.length <= 500,
      'Las observaciones no pueden superar 500 caracteres'
    ),
});

// Tipo de entrada del formulario (con campos opcionales como string | undefined)
export type VehiculoFormData = z.input<typeof vehiculoCreateSchema>;

// Tipo de salida después de transformaciones (lo que recibe la API)
export type VehiculoData = z.output<typeof vehiculoCreateSchema>;

// Constantes para usar en los inputs HTML (limitar caracteres mientras se escribe)
export const VEHICULO_FIELD_LIMITS = {
  placa: 50,
  observaciones: 500,
  fotoUrl: 500,
} as const;