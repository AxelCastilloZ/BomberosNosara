import React from "react";
import { FaUsers, FaUserPlus } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi";

import { useUsers } from "../../hooks/users/useUsers";
import AddUserForm from "../../components/ui/Administrativa/UsuariosAdmin/AddUserForm";
import UsuariosTable from "../../components/ui/Administrativa/UsuariosAdmin/UsuariosTable";
import EditUser from "../../components/ui/Administrativa/UsuariosAdmin/EditUser";
import ConfirmDelete from "../../components/ui/Administrativa/UsuariosAdmin/ConfirmDelete";
import type { User } from "../../types/user";

// Constantes de roles
import { ROLES, ROLE_LABELS } from "../../constants/roles";
import type { RoleName } from "../../types/user";

export default function AdminUsuariosPage() {
  const { users = [], isLoading, remove } = useUsers();

  const [view, setView] = React.useState<"menu" | "list" | "add">("menu");
  const [filterRole, setFilterRole] = React.useState<"Todos" | RoleName>("Todos");
  const [editing, setEditing] = React.useState<User | null>(null);
  const [deleting, setDeleting] = React.useState<User | null>(null);

  // Opciones del select (agrega "Todos" + roles definidos en constantes)
  const roleOptions: ("Todos" | RoleName)[] = React.useMemo(
    () => ["Todos", ...ROLES],
    []
  );

  // Filtro de usuarios por rol
  const filteredUsers = React.useMemo(() => {
    if (filterRole === "Todos") return users;
    return users.filter((u) => u.roles?.some((r) => r.name === filterRole));
  }, [users, filterRole]);

  return (
    <div className="p-6 pt-24 max-w-7xl mx-auto">
      <h1 className="lg:text-4xl md:text-3xl sm:text-2xl font-extrabold text-red-700 mb-6 flex items-center gap-2">
        <FaUsers className="text-red-700" />
        Gestión de Usuarios
      </h1>

      {/* Vista inicial con menú */}
      {view === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setView("list")}
            className="cursor-pointer bg-white hover:bg-gray-50 shadow-lg rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center"
          >
            <HiOutlineUserGroup className="text-4xl text-red-600 mb-2" />
            <h2 className="text-lg font-semibold">Lista de Usuarios</h2>
            <p className="text-sm text-gray-600">
              Ver todos los usuarios registrados y gestionarlos
            </p>
          </div>

          <div
            onClick={() => setView("add")}
            className="cursor-pointer bg-white hover:bg-gray-50 shadow-lg rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center"
          >
            <FaUserPlus className="text-4xl text-red-600 mb-2" />
            <h2 className="text-lg font-semibold">Agregar Usuario</h2>
            <p className="text-sm text-gray-600">
              Registrar un nuevo usuario en el sistema
            </p>
          </div>
        </div>
      )}

      {/* Vista de lista */}
      {view === "list" && (
        <div className="space-y-4">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline text-sm mb-2"
          >
            ← Volver
          </button>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <HiOutlineUserGroup className="text-gray-800" />
              Usuarios existentes
            </h2>

            <div className="flex gap-2">
              {/* Select dinámico con los roles */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as "Todos" | RoleName)}
                className="border rounded-lg p-2"
              >
                {roleOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "Todos" ? "Todos los roles" : ROLE_LABELS[opt]}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setView("add")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                + Nuevo Usuario
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-gray-600">Cargando usuarios...</p>
          ) : (
            <UsuariosTable
              users={filteredUsers}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          )}
        </div>
      )}

      {/* Vista de agregar */}
      {view === "add" && (
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline text-sm mb-4"
          >
            ← Volver
          </button>
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
              <FaUserPlus className="text-black lg:text-3xl sm:text-3xl" />
              Crear nuevo usuario
            </h2>
            <AddUserForm />
          </div>
        </div>
      )}

      {/* Modales */}
      {editing && <EditUser user={editing} onClose={() => setEditing(null)} />}

      {deleting && (
        <ConfirmDelete
          userName={deleting.username}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await remove.mutateAsync(deleting.id);
              setDeleting(null);
            } catch (err: any) {
              alert(err?.message || "Error al eliminar");
            }
          }}
        />
      )}
    </div>
  );
}
