// src/pages/Administrativas/AdminUsuariosPage.tsx

import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { ListaUsuarios } from '../../modules/usuarios/components/ListaUsuarios';
import { CrearUsuarioModal } from '../../modules/usuarios/components/modals/CrearUsuarioModal';
import { EditarUsuarioModal } from '../../modules/usuarios/components/modals/EditarUsuarioModal';
import { EliminarUsuarioModal } from '../../modules/usuarios/components/modals/EliminarUsuarioModal';
import type { User } from '../../types/user.types';

export default function AdminUsuariosPage() {
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [editando, setEditando] = useState<User | null>(null);
  const [eliminando, setEliminando] = useState<User | null>(null);

  return (
    <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-red-700" />
          <div>
            <h1 className="text-3xl font-extrabold text-red-800">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 text-sm">
              Administra los usuarios del sistema de Bomberos de Nosara
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCrearModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Lista de Usuarios */}
      <ListaUsuarios
        onEdit={setEditando}
        onDelete={setEliminando}
      />

      {/* Modales */}
      <CrearUsuarioModal
        open={showCrearModal}
        onOpenChange={setShowCrearModal}
        onSuccess={() => {
          setShowCrearModal(false);
        }}
      />

      <EditarUsuarioModal
        usuario={editando}
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
        onSuccess={() => {
          setEditando(null);
        }}
      />

      <EliminarUsuarioModal
        usuario={eliminando}
        open={!!eliminando}
        onOpenChange={(open) => !open && setEliminando(null)}
        onSuccess={() => {
          setEliminando(null);
        }}
      />
    </div>
  );
}