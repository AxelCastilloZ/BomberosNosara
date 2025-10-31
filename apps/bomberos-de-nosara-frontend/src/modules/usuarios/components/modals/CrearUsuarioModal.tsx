// src/modules/usuarios/components/modals/CrearUsuarioModal.tsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useUsuarios } from '../../hooks/useUsuarios';
import { ROLES, ROLE_LABELS } from '../../../../constants/roles';
import { 
  createUsuarioSchema, 
  USUARIO_FIELD_LIMITS,
  type CreateUsuarioFormData 
} from '../../utils/usuarioValidations';
import type { RoleName } from '../../../../types/user.types';
import type { CrearUsuarioModalProps } from '../../types';

export const CrearUsuarioModal: React.FC<CrearUsuarioModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error: showError } = useNotifications();
  const { create, validateUnique } = useUsuarios();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateUsuarioFormData>({
    resolver: zodResolver(createUsuarioSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: '',
    },
  });

  const usernameValue = watch('username');
  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateUsuarioFormData) => {
    try {
      await create.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password,
        roles: [data.role as RoleName],
      });
      
      success('Usuario creado exitosamente');
      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      
      if (err?.code === 'DUPLICATE_KEY') {
        const field = err.field as 'email' | 'username';
        setError(field, {
          type: 'server',
          message: err.message || 'Ya existe un registro con ese valor',
        });
      } else {
        showError(err?.message || 'Error al crear el usuario');
      }
    }
  };

  const handleUsernameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value || errors.username) return;
    
    const res = await validateUnique('username', value);
    if (res === false) {
      setError('username', {
        type: 'server',
        message: 'Este nombre de usuario ya está en uso',
      });
    } else if (res === true) {
      clearErrors('username');
    }
  };

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value || errors.email) return;
    
    const res = await validateUnique('email', value);
    if (res === false) {
      setError('email', {
        type: 'server',
        message: 'Este correo electrónico ya está en uso',
      });
    } else if (res === true) {
      clearErrors('email');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Usuario</h2>
            <p className="text-sm text-gray-500 mt-1">
              Completa los datos del nuevo usuario del sistema
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting || create.isPending}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información de Cuenta */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Información de Cuenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nombre de Usuario <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Ej: jperez"
                  maxLength={USUARIO_FIELD_LIMITS.username}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.username
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  disabled={isSubmitting || create.isPending}
                  {...register('username')}
                  onBlur={handleUsernameBlur}
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  {(usernameValue?.length || 0)}/{USUARIO_FIELD_LIMITS.username} caracteres
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  maxLength={USUARIO_FIELD_LIMITS.email}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  disabled={isSubmitting || create.isPending}
                  {...register('email')}
                  onBlur={handleEmailBlur}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  {(emailValue?.length || 0)}/{USUARIO_FIELD_LIMITS.email} caracteres
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  maxLength={USUARIO_FIELD_LIMITS.password}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  disabled={isSubmitting || create.isPending}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  {(passwordValue?.length || 0)}/{USUARIO_FIELD_LIMITS.password} caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Rol */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Selecciona el rol que tendrá el usuario en el sistema
            </p>
            <select
              id="role"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.role
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-red-500'
              }`}
              disabled={isSubmitting || create.isPending}
              {...register('role')}
            >
              <option value="">Selecciona un rol</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role as RoleName]}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-2">{errors.role.message}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || create.isPending}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || create.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || create.isPending ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};