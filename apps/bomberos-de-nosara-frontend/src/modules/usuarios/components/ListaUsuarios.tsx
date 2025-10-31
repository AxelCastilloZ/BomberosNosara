


import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, MoreVertical, Users } from 'lucide-react';
import { useUsuarios } from '../hooks/useUsuarios';
import { ROLES, ROLE_LABELS } from '../../../constants/roles';
import { getRoleLabels, filterUsuariosBySearch, filterUsuariosByRole } from '../utils/usuarioHelpers';
import type { RoleName } from '../../../types/user.types';
import type { ListaUsuariosProps } from '../types';

export const ListaUsuarios: React.FC<ListaUsuariosProps> = ({
  onEdit,
  onDelete,
}) => {
  const { usuarios, isLoading } = useUsuarios();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<RoleName | 'Todos'>('Todos');

  // Aplicar filtros
  const usuariosFiltrados = useMemo(() => {
    let resultado = usuarios;
    
    // Filtro de búsqueda
    if (search) {
      resultado = filterUsuariosBySearch(resultado, search);
    }
    
    // Filtro de rol
    if (filterRole !== 'Todos') {
      resultado = filterUsuariosByRole(resultado, filterRole);
    }
    
    return resultado;
  }, [usuarios, search, filterRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario, email, nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Filtro de Rol */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as RoleName | 'Todos')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="Todos">Todos los roles</option>
            {ROLES.map((rol) => (
              <option key={rol} value={rol}>
                {ROLE_LABELS[rol as RoleName]}
              </option>
            ))}
          </select>
        </div>

        {/* Contador de resultados */}
        {(search || filterRole !== 'Todos') && (
          <div className="mt-3 text-sm text-gray-600">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuario
            {usuarios.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Lista de Usuarios */}
      {usuariosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            {search || filterRole !== 'Todos'
              ? 'No se encontraron usuarios con los filtros aplicados'
              : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <>
          {/* VISTA DESKTOP - Tabla */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-red-700">
                            {usuario.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.username}
                          </div>
                          {usuario.nombre && usuario.apellido && (
                            <div className="text-xs text-gray-500">
                              {usuario.nombre} {usuario.apellido}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {usuario.roles.map((rol) => (
                          <span
                            key={rol.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {ROLE_LABELS[rol.name as RoleName]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(usuario)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(usuario)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL - Cards */}
          <div className="md:hidden space-y-3">
            {usuariosFiltrados.map((usuario) => (
              <div
                key={usuario.id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {/* Header del card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-red-700">
                        {usuario.username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{usuario.username}</h3>
                      {usuario.nombre && usuario.apellido && (
                        <p className="text-xs text-gray-500">
                          {usuario.nombre} {usuario.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Email */}
                <div className="text-sm text-gray-600">{usuario.email}</div>

                {/* Roles */}
                <div className="flex flex-wrap gap-1">
                  {usuario.roles.map((rol) => (
                    <span
                      key={rol.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {ROLE_LABELS[rol.name as RoleName]}
                    </span>
                  ))}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => onEdit(usuario)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm font-medium">Editar</span>
                  </button>
                  <button
                    onClick={() => onDelete(usuario)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Resumen */}
      {usuariosFiltrados.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Total: {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};