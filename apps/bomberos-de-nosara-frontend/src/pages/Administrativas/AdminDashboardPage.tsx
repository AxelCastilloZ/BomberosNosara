import {
  FaUserShield,
  FaUsers,
  FaFireExtinguisher,
  FaTruck,
  FaChartBar,
  FaComments,
  FaNewspaper,
  FaBook,
  FaHandsHelping
} from "react-icons/fa";
import { getUserRoles } from '../../auth/AdminAuth'; 

const allDashboardItems = [
  {
    icon: <FaUserShield size={24} />,
    label: "Administrar Donantes",
    href: "/admin/donantes",
    roles: ["SUPERUSER", "ADMIN"],
  },
  {
    icon: <FaUsers size={24} />,
    label: "Gestión de Usuarios",
    href: "/admin/usuarios",
    roles: ["SUPERUSER"],
  },
  {
    icon: <FaFireExtinguisher size={24} />,
    label: "Inventario de Equipo",
    href: "/admin/equipo",
    roles: ["SUPERUSER", "ADMIN"],
  },
  {
    icon: <FaTruck size={24} />,
    label: "Inventario de Vehículos",
    href: "/admin/vehiculos",
    roles: ["SUPERUSER", "ADMIN","PERSONAL_BOMBERIL" ],
  },
  {
    icon: <FaChartBar size={24} />,
    label: "Estadísticas",
    href: "/admin/estadisticas",
    roles: ["SUPERUSER", "ADMIN"],
  },

 {
  icon: <FaBook size={24} />, 
  label: "Material Interno",
  href: "/admin/material-interno",
  roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL", "VOLUNTARIO"],
},


  {
    icon: <FaComments size={24} />,
    label: "Chat Interno",
    href: "/admin/chat",
    roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL", "VOLUNTARIO"],
  },
  {
    icon: <FaNewspaper size={24} />,
    label: "Administrar Noticias",
    href: "/admin/noticias",
    roles: ["SUPERUSER", "ADMIN"],
  },
  {
    icon: <FaComments size={24} />,
    label: "Sugerencias",
    href: "/admin/sugerencias",
    roles: ["SUPERUSER", "ADMIN"],
  },
  {
  icon: <FaHandsHelping size={24} />, 
  label: "Voluntarios",
  href: '/voluntario/registro-horas',
  roles: ["VOLUNTARIO"],
},
{
  icon: <FaHandsHelping size={24} />, 
  label: "Voluntarios",
  href: '/admin/participaciones',
  roles: ["SUPERUSER", "ADMIN"],
},
];

const AdminDashboardPage = () => {
  const userRoles = getUserRoles();

  const dashboardItems = allDashboardItems.filter(item =>
    item.roles.some(role => userRoles.includes(role))
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-red-700">Panel Administrativo</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map(({ icon, label, href }) => (
          <a
            key={label}
            href={href}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-md transition-all hover:-translate-y-1 flex items-center space-x-4 hover:bg-gray-50"
          >
            <div className="text-red-600">{icon}</div>
            <span className="font-medium text-gray-800">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
