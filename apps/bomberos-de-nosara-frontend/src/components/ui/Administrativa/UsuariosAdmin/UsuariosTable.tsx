import React from 'react';
import { ROLE_LABELS } from '../../../../constants/roles';
import type { User } from '../../../../types/user';

type Props = {
  users: User[];
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
};

const UsuariosTable: React.FC<Props> = ({ users, onEdit, onDelete }) => {
  if (!users.length) {
    return <p className="text-gray-600">No hay usuarios registrados.</p>;
  }

  return (
    <>
      {/* Cards mobile */}
      <div className="sm:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-orange-50 border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-gray-900">{u.username}</div>
            <div className="text-sm text-gray-700">{u.email}</div>
            <div className="text-sm text-gray-700 mt-1">
              Roles: {u.roles.map(r => ROLE_LABELS[r.name]).join(', ')}
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => onEdit(u)} className="text-blue-600 hover:underline">Editar</button>
              <button onClick={() => onDelete(u)} className="text-red-600 hover:underline">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla desktop */}
      <div className="hidden sm:block">
        <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Roles</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.roles.map(r => ROLE_LABELS[r.name]).join(', ')}</td>
                <td className="p-3 text-right">
                  <button onClick={() => onEdit(u)} className="mr-3 text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => onDelete(u)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsuariosTable;
