import { useMemo, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  FaUserShield, FaUsers, FaFireExtinguisher, FaTruck,
  FaChartBar, FaComments, FaNewspaper, FaBook,
  FaHandshake, FaCommentAlt
} from 'react-icons/fa';


import { getUserRoles } from '../../service/auth';

type DashboardItem = {
  icon: ReactNode;   
  label: string;
  href: string;
  roles: string[];
};

const ALL_ITEMS: DashboardItem[] = [
  { icon: <FaUserShield size={24} />, label: 'Administrar Donantes', href: '/admin/donantes', roles: ['SUPERUSER', 'ADMIN'] },
  { icon: <FaUsers size={24} />, label: 'Gestión de Usuarios', href: '/admin/usuarios', roles: ['SUPERUSER'] },
  { icon: <FaFireExtinguisher size={24} />, label: 'Inventario de Equipo', href: '/admin/equipo', roles: ['SUPERUSER', 'ADMIN','PERSONAL_BOMBERIL'] },
  { icon: <FaTruck size={24} />, label: 'Inventario de Vehículos', href: '/admin/vehiculos', roles: ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL'] },
  { icon: <FaChartBar size={24} />, label: 'Estadísticas', href: '/admin/estadisticas', roles: ['SUPERUSER', 'ADMIN'] },
  { icon: <FaBook size={24} />, label: 'Material Interno', href: '/admin/material-interno', roles: ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] },
  { icon: <FaComments size={24} />, label: 'Chat Interno', href: '/admin/chat', roles: ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] },
  { icon: <FaNewspaper size={24} />, label: 'Administrar Noticias', href: '/admin/noticias', roles: ['SUPERUSER', 'ADMIN'] },
  //{ icon: <FaComments size={24} />, label: 'Sugerencias', href: '/admin/sugerencias', roles: ['SUPERUSER', 'ADMIN'] },
  { icon: <FaHandshake size={24} />, label: 'Gestión de Voluntarios', href: '/admin/voluntarios', roles: ['SUPERUSER', 'ADMIN'] },
  { icon: <FaHandshake size={24} />, label: 'Registro Voluntarios', href: '/admin/registro-horas', roles: ['VOLUNTARIO'] },

];

export default function AdminDashboardPage() {
  const userRoles = useMemo(() => getUserRoles(), []);
  const items = useMemo(
    () => ALL_ITEMS.filter(i => i.roles.some(r => userRoles.includes(r))),
    [userRoles]
  );

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
