// src/modules/usuarios/utils/usuarioValidations.ts

import { z } from 'zod';

// ==================== LÍMITES DE CAMPOS ====================

export const USUARIO_FIELD_LIMITS = {
  username: 50,
  email: 100,
  password: 100,
} as const;

// ==================== REGEX PATTERNS ====================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// ==================== MENSAJES DE ERROR ====================

const ERROR_MESSAGES = {
  username: {
    required: 'El nombre de usuario es obligatorio',
    minLength: 'Debe tener al menos 3 caracteres',
    maxLength: `Máximo ${USUARIO_FIELD_LIMITS.username} caracteres`,
    pattern: 'Solo letras, números, guiones y guiones bajos',
  },
  email: {
    required: 'El correo electrónico es obligatorio',
    invalid: 'Correo electrónico inválido',
    maxLength: `Máximo ${USUARIO_FIELD_LIMITS.email} caracteres`,
  },
  password: {
    required: 'La contraseña es obligatoria',
    minLength: 'Debe tener al menos 8 caracteres',
    maxLength: `Máximo ${USUARIO_FIELD_LIMITS.password} caracteres`,
  },
  role: {
    required: 'Debes seleccionar un rol',
  },
};

// ==================== SCHEMAS DE VALIDACIÓN ====================

/**
 * Schema para crear un nuevo usuario
 */
export const createUsuarioSchema = z.object({
  username: z
    .string()
    .min(1, ERROR_MESSAGES.username.required)
    .min(3, ERROR_MESSAGES.username.minLength)
    .max(USUARIO_FIELD_LIMITS.username, ERROR_MESSAGES.username.maxLength)
    .regex(USERNAME_REGEX, ERROR_MESSAGES.username.pattern)
    .trim(),

  email: z
    .string()
    .min(1, ERROR_MESSAGES.email.required)
    .email(ERROR_MESSAGES.email.invalid)
    .max(USUARIO_FIELD_LIMITS.email, ERROR_MESSAGES.email.maxLength)
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, ERROR_MESSAGES.password.required)
    .min(8, ERROR_MESSAGES.password.minLength)
    .max(USUARIO_FIELD_LIMITS.password, ERROR_MESSAGES.password.maxLength),

  role: z
    .string()
    .min(1, ERROR_MESSAGES.role.required),
});

/**
 * Schema para editar un usuario existente
 */
export const updateUsuarioSchema = z.object({
  username: z
    .string()
    .min(1, ERROR_MESSAGES.username.required)
    .min(3, ERROR_MESSAGES.username.minLength)
    .max(USUARIO_FIELD_LIMITS.username, ERROR_MESSAGES.username.maxLength)
    .regex(USERNAME_REGEX, ERROR_MESSAGES.username.pattern)
    .trim(),

  email: z
    .string()
    .min(1, ERROR_MESSAGES.email.required)
    .email(ERROR_MESSAGES.email.invalid)
    .max(USUARIO_FIELD_LIMITS.email, ERROR_MESSAGES.email.maxLength)
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, ERROR_MESSAGES.password.minLength)
    .max(USUARIO_FIELD_LIMITS.password, ERROR_MESSAGES.password.maxLength)
    .optional()
    .or(z.literal('')),

  role: z
    .string()
    .min(1, ERROR_MESSAGES.role.required),
});

// ==================== TIPOS ====================

export type CreateUsuarioFormData = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioFormData = z.infer<typeof updateUsuarioSchema>;

// ==================== FUNCIONES DE VALIDACIÓN ====================

/**
 * Valida que un username sea válido
 */
export const validateUsername = (username: string): boolean => {
  return USERNAME_REGEX.test(username) && 
         username.length >= 3 && 
         username.length <= USUARIO_FIELD_LIMITS.username;
};

/**
 * Valida que un email sea válido
 */
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email) && 
         email.length <= USUARIO_FIELD_LIMITS.email;
};

/**
 * Valida que una contraseña sea válida
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && 
         password.length <= USUARIO_FIELD_LIMITS.password;
};