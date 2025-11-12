// src/modules/usuarios/components/modals/EliminarUsuarioModal.tsx

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useUsuarios } from '../../hooks/useUsuarios';
import type { EliminarUsuarioModalProps } from '../../types';

export const EliminarUsuarioModal: React.FC<EliminarUsuarioModalProps> = ({
  usuario,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error: showError } = useNotifications();
  const { delete: deleteUsuario } = useUsuarios();

  const handleEliminar = async () => {
    if (!usuario) return;

    try {
      await deleteUsuario.mutateAsync(usuario.id);
      success('Usuario desactivado exitosamente');
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error al desactivar usuario:', err);
      showError(err?.message || 'Error al desactivar el usuario');
    }
  };

  if (!usuario) return null;

  // 🎯 Construir detalles en formato estandarizado
  const details: Array<{ label: string; value: string }> = [];
  
  if (usuario.email) {
    details.push({ label: 'Email', value: usuario.email });
  }
  
  if (usuario.roles && usuario.roles.length > 0) {
    details.push({ 
      label: 'Roles', 
      value: usuario.roles.map((r) => r.name).join(', ') 
    });
  }

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleEliminar}
      title="Desactivar Usuario"
      description={`¿Estás seguro de que deseas desactivar al usuario ${usuario.username}?`}
      confirmText={deleteUsuario.isPending ? 'Desactivando...' : 'Desactivar Usuario'}
      cancelText="Cancelar"
      variant="destructive"
      icon={<AlertTriangle className="h-5 w-5" />}
      isLoading={deleteUsuario.isPending}
      details={details.length > 0 ? details : undefined}
    />
  );
};