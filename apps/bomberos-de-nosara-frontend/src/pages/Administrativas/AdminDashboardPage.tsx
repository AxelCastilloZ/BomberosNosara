import { useMemo, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  FaUserShield, FaUsers, FaFireExtinguisher, FaTruck,
  FaChartBar, FaComments, FaNewspaper, FaBook,
  FaHandshake, FaCommentAlt
} from 'react-icons/fa';

import { getUserRoles } from '../../service/auth';
import { RoleEnum } from '../../types/role.enum';

type DashboardItem = {
  icon: ReactNode;
  label: string;
  href: string;
  roles: RoleEnum[];
};

const ALL_ITEMS: Omit<DashboardItem, 'href'>[] = [
  { icon: <FaUserShield size={24} />, label: 'Administrar Donantes', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN] },
  { icon: <FaUsers size={24} />, label: 'Gestión de Usuarios', roles: [RoleEnum.SUPERUSER] },
  { icon: <FaFireExtinguisher size={24} />, label: 'Inventario de Equipo', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL] },
  { icon: <FaTruck size={24} />, label: 'Inventario de Vehículos', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL] },
  { icon: <FaChartBar size={24} />, label: 'Estadísticas', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN] },
  { icon: <FaBook size={24} />, label: 'Material Interno', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL, RoleEnum.VOLUNTARIO] },
  { icon: <FaComments size={24} />, label: 'Chat Interno', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL, RoleEnum.VOLUNTARIO] },
  { icon: <FaNewspaper size={24} />, label: 'Administrar Noticias', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN] },
  { icon: <FaComments size={24} />, label: 'Sugerencias', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN] },
  { icon: <FaHandshake size={24} />, label: 'Gestión de Voluntarios', roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN] },
  { icon: <FaHandshake size={24} />, label: 'Registro Voluntarios', roles: [RoleEnum.VOLUNTARIO] },
];

export default function AdminDashboardPage() {
  const userRoles = useMemo(() => getUserRoles(), []);

  const items = useMemo(() => {
    return ALL_ITEMS
      .filter(i => i.roles.some(r => userRoles.includes(r)))
      .map(i => {
        // 🚀 Caso especial: Material Interno
        if (i.label === 'Material Interno') {
          if (userRoles.includes(RoleEnum.SUPERUSER) || userRoles.includes(RoleEnum.ADMIN)) {
            return { ...i, href: '/admin/material-interno' };
          }
          return { ...i, href: '/admin/material-voluntarios' };
        }

        switch (i.label) {
          case 'Administrar Donantes':
            return { ...i, href: '/admin/donantes' };
          case 'Gestión de Usuarios':
            return { ...i, href: '/admin/usuarios' };
          case 'Inventario de Equipo':
            return { ...i, href: '/admin/equipo' };
          case 'Inventario de Vehículos':
            return { ...i, href: '/admin/vehiculos' };
          case 'Estadísticas':
            return { ...i, href: '/admin/estadisticas' };
          case 'Chat Interno':
            return { ...i, href: '/admin/chat' };
          case 'Administrar Noticias':
            return { ...i, href: '/admin/noticias' };
          case 'Sugerencias':
            return { ...i, href: '/admin/sugerencias' };
          case 'Gestión de Voluntarios':
            return { ...i, href: '/admin/voluntarios' };
          case 'Registro Voluntarios':
            return { ...i, href: '/admin/registro-horas' };
          default:
            return { ...i, href: '#' };
        }
      });
  }, [userRoles]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-700">Panel Administrativo</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/chat"
              className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Ir al chat"
              title="Ir al chat"
            >
              <FaCommentAlt className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ icon, label, href }) => (
            <Link
              key={label}
              to={href}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-md transition-all hover:-translate-y-1 flex items-center space-x-4 hover:bg-gray-50"
            >
              <div className="text-red-600">{icon}</div>
              <span className="font-medium text-gray-800">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
