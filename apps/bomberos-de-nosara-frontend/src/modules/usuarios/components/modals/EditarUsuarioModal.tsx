// src/modules/usuarios/components/modals/EditarUsuarioModal.tsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseModal } from '../../../../components/ui/base-modal';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useUsuarios } from '../../hooks/useUsuarios';
import { ROLES, ROLE_LABELS } from '../../../../constants/roles';
import { 
  updateUsuarioSchema, 
  USUARIO_FIELD_LIMITS,
  type UpdateUsuarioFormData 
} from '../../utils/usuarioValidations';
import type { RoleName } from '../../../../types/user.types';
import type { EditarUsuarioModalProps } from '../../types';

export const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({
  usuario,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error: showError } = useNotifications();
  const { update } = useUsuarios();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUsuarioFormData>({
    resolver: zodResolver(updateUsuarioSchema),
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

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (open && usuario) {
      reset({
        username: usuario.username,
        email: usuario.email,
        password: '',
        role: usuario.roles[0]?.name || '',
      });
    }
  }, [open, usuario, reset]);

  const onSubmit = async (data: UpdateUsuarioFormData) => {
    if (!usuario) return;

    try {
      // Construir el payload limpio
      const updateData: any = {
        username: data.username,
        email: data.email,
        roles: [data.role as RoleName],
      };

      // Solo incluir password si se escribió algo
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
      }

      await update.mutateAsync({
        id: usuario.id,
        data: updateData,
      });

      success('Usuario actualizado exitosamente');
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err);

      if (err?.code === 'DUPLICATE_KEY') {
        const message = err.message || 'Ya existe un registro con ese valor';
        
        // Extraer el valor que está causando el conflicto del mensaje
        const match = message.match(/'([^']+)'/);
        const conflictValue = match ? match[1] : '';
        
        console.log('🔍 Valor en conflicto:', conflictValue);
        console.log('🔍 Username actual:', data.username);
        console.log('🔍 Email actual:', data.email);
        
        // Comparar el valor en conflicto con los campos del formulario
        let correctField: 'email' | 'username' = 'username';
        
        if (conflictValue) {
          if (conflictValue.toLowerCase() === data.username.toLowerCase()) {
            correctField = 'username';
          } else if (conflictValue.toLowerCase() === data.email.toLowerCase()) {
            correctField = 'email';
          } else {
            correctField = err.field as 'email' | 'username';
          }
        }
        
        // Mensaje personalizado según el campo
        const customMessage = correctField === 'username'
          ? `El nombre de usuario '${conflictValue}' ya está en uso`
          : `El correo '${conflictValue}' ya está en uso`;
        
        setError(correctField, {
          type: 'server',
          message: customMessage,
        });
      } else {
        showError(err?.message || 'Error al actualizar el usuario');
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !update.isPending) {
      onOpenChange(false);
    }
  };

  if (!usuario) return null;

  // Footer content con botones
  const footerContent = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isSubmitting || update.isPending}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="editar-usuario-form"
        disabled={isSubmitting || update.isPending}
      >
        {isSubmitting || update.isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={handleClose}
      title="Editar Usuario"
      description={`Actualiza la información de ${usuario.username}`}
      size="md"
      footerContent={footerContent}
    >
      <form id="editar-usuario-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Información de Cuenta */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Información de Cuenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Nombre de Usuario <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ej: jperez"
                  maxLength={USUARIO_FIELD_LIMITS.username}
                  className={errors.username ? 'border-red-500' : ''}
                  disabled={isSubmitting || update.isPending}
                  {...register('username')}
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
                <Label htmlFor="email">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  maxLength={USUARIO_FIELD_LIMITS.email}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isSubmitting || update.isPending}
                  {...register('email')}
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
                <Label htmlFor="password">
                  Nueva Contraseña (Opcional)
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Dejar vacío para no cambiar"
                  maxLength={USUARIO_FIELD_LIMITS.password}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isSubmitting || update.isPending}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Solo completa este campo si deseas cambiar la contraseña • {(passwordValue?.length || 0)}/{USUARIO_FIELD_LIMITS.password} caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rol <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Selecciona el rol que tendrá el usuario en el sistema
            </p>
            <Select
              id="role"
              className={errors.role ? 'border-red-500' : ''}
              disabled={isSubmitting || update.isPending}
              {...register('role')}
            >
              <option value="">Selecciona un rol</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role as RoleName]}
                </option>
              ))}
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>
        </div>
      </form>
    </BaseModal>
  );
};