// src/modules/usuarios/components/modals/CrearUsuarioModal.tsx

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useUsuarios } from '../../hooks/useUsuarios';
import { ROLES, ROLE_LABELS } from '../../../../constants/roles';
import type { RoleName } from '../../../../types/user.types';
import type { CrearUsuarioModalProps, CreateUsuarioDto } from '../../types';
import { useForm } from 'react-hook-form';

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
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateUsuarioDto>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      roles: [],
    },
  });

  const selectedRoles = watch('roles') || [];

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateUsuarioDto) => {
    // Validar que tenga al menos un rol
    if (!data.roles || data.roles.length === 0) {
      setError('roles', {
        type: 'required',
        message: 'Debes seleccionar al menos un rol',
      });
      return;
    }

    try {
      // Payload limpio - solo campos requeridos
      const payload: CreateUsuarioDto = {
        username: data.username,
        email: data.email,
        password: data.password,
        roles: data.roles,
      };

      await create.mutateAsync(payload);
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

  const handleRoleToggle = (role: RoleName) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    setValue('roles', newRoles, { shouldValidate: true });
    
    // Limpiar error de roles si ahora tiene al menos uno
    if (newRoles.length > 0) {
      clearErrors('roles');
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
                  Nombre de Usuario <span className="text-red-600">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Ej: jperez"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.username
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  {...register('username', {
                    required: 'El nombre de usuario es obligatorio',
                    minLength: {
                      value: 3,
                      message: 'Debe tener al menos 3 caracteres',
                    },
                    onBlur: async (e) => {
                      const res = await validateUnique('username', e.target.value);
                      if (res === false) {
                        setError('username', {
                          type: 'server',
                          message: 'Este usuario ya existe',
                        });
                      } else if (res === true) {
                        clearErrors('username');
                      }
                    },
                  })}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Correo inválido',
                    },
                    onBlur: async (e) => {
                      const res = await validateUnique('email', e.target.value);
                      if (res === false) {
                        setError('email', {
                          type: 'server',
                          message: 'Este correo ya existe',
                        });
                      } else if (res === true) {
                        clearErrors('email');
                      }
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña <span className="text-red-600">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 8,
                      message: 'Debe tener al menos 8 caracteres',
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roles <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Selecciona al menos un rol para el usuario
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role as RoleName)}
                    onChange={() => handleRoleToggle(role as RoleName)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {ROLE_LABELS[role as RoleName]}
                  </span>
                </label>
              ))}
            </div>
            {errors.roles && (
              <p className="text-sm text-red-600 mt-2">{errors.roles.message}</p>
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