


import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
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
      success('Usuario eliminado exitosamente');
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      showError(err?.message || 'Error al eliminar el usuario');
    }
  };

  if (!open || !usuario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Eliminar Usuario</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={deleteUsuario.isPending}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <span className="font-semibold text-gray-900">{usuario.username}</span>?
          </p>

          {usuario.email && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {usuario.email}
              </p>
              {usuario.roles && usuario.roles.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Roles:</span>{' '}
                  {usuario.roles.map((r) => r.name).join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong> Advertencia:</strong> Esta acción no se puede deshacer. Toda la
              información asociada a este usuario será eliminada permanentemente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={deleteUsuario.isPending}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEliminar}
            disabled={deleteUsuario.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleteUsuario.isPending ? 'Eliminando...' : 'Eliminar Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};