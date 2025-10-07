// src/components/common/schemas/vehiculos.validations.ts
import { z } from 'zod';

// Validación específica para kilometraje de vehículos
const kilometraje = z.coerce
  .number()
  .int('Debe ser un número entero, sin decimales')
  .min(0, 'El kilometraje no puede ser negativo')
  .max(999999, 'El kilometraje no puede superar 999,999 km');

// URL que permite string vacío o undefined
const urlOptional = z.string()
  .url('Debe ser una URL válida')
  .optional()
  .or(z.literal(''));

export const vehiculoCreateSchema = z.object({
  placa: z.string()
    .min(1, 'La placa es obligatoria')
    .min(3, 'La placa debe tener al menos 3 caracteres')
    .max(50, 'La placa no puede superar 50 caracteres')
    .transform(val => val.trim()),

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
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      'Debe ser una URL válida'
    ),

  observaciones: z.string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.length <= 500,
      'Las observaciones no pueden superar 500 caracteres'
    ),
});

// Tipo de entrada del formulario (con campos opcionales como string | undefined)
export type VehiculoFormData = z.input<typeof vehiculoCreateSchema>;

// Tipo de salida después de transformaciones (lo que recibe la API)
export type VehiculoData = z.output<typeof vehiculoCreateSchema>;