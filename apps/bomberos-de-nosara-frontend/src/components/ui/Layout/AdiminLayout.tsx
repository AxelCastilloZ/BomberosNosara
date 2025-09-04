import { ReactNode, useMemo, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  FaUserShield, FaUsers, FaTruck, FaChartBar,
  FaComments, FaBook, FaHome, FaBars, FaTimes
} from "react-icons/fa";
import { getUserRoles } from "../../../service/auth";

type SidebarItem = {
  icon: ReactNode;
  label: string;
  href: string;
  roles: string[];
};

const ALL_ITEMS: SidebarItem[] = [
  { icon: <FaHome />, label: "Dashboard", href: "/admin", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaUserShield />, label: "Administrar Donantes", href: "/admin/donantes", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaUsers />, label: "Gestión de Usuarios", href: "/admin/usuarios", roles: ["SUPERUSER"] },
  { icon: <FaTruck />, label: "Inventario de Vehículos", href: "/admin/vehiculos", roles: ["SUPERUSER", "ADMIN","PERSONAL_BOMBERIL"] },
  { icon: <FaChartBar />, label: "Estadísticas", href: "/admin/estadisticas", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaBook />, label: "Material Interno", href: "/admin/material-interno", roles: ["SUPERUSER","ADMIN","PERSONAL_BOMBERIL","VOLUNTARIO"] },
  { icon: <FaComments />, label: "Chat Interno", href: "/admin/chat", roles: ["SUPERUSER","ADMIN","PERSONAL_BOMBERIL","VOLUNTARIO"] },
  { icon: <FaComments />, label: "Sugerencias", href: "/admin/sugerencias", roles: ["SUPERUSER", "ADMIN"] },
];

/** Paleta marca Bomberos (rojos existentes) */
const BRAND = {
  sidebarBg: "bg-gradient-to-b from-red-900 via-red-800 to-red-700",
  itemBase:
    "group flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
  itemHover: "hover:bg-white/10",
  itemActive:
    "relative bg-white/10 text-white ring-1 ring-white/15 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1.5 before:rounded-r before:bg-red-400",
  subtleBorder: "border-white/10",
  sectionTitle: "text-[11px] uppercase tracking-[0.16em] text-red-100/80",
};

function NavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={[
        BRAND.itemBase,
        BRAND.itemHover,
        active ? BRAND.itemActive : "",
      ].join(" ")}
      activeOptions={{ exact: false }}
    >
      <span className="text-[18px]">{icon}</span>
      <span className="font-medium">{label}</span>
      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-red-200">
        ↗
      </span>
    </Link>
  );
}

export default function AdminLayout() {
  const userRoles = useMemo(() => getUserRoles(), []);
  const items = useMemo(
    () => ALL_ITEMS.filter(i => i.roles.some(r => userRoles.includes(r))),
    [userRoles]
  );

  const { location } = useRouterState();
  const [open, setOpen] = useState(false);

  // ocultar sidebar solo en /admin (dashboard)
  const isAdminHome = location.pathname === "/admin";

  // ✅ Dashboard activo solo en /admin exacto; resto permite subrutas
  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return (
      location.pathname === href ||
      location.pathname.startsWith(href + "/")
    );
  };

  if (isAdminHome) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar móvil */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Panel Administrativo</h2>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md border border-gray-200"
          aria-label="Abrir menú"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Scrim para móvil cuando el menú está abierto */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <div className="flex">
        {/* Sidebar FIJO, sin scroll interno y pegado al navbar */}
        <aside
          className={[
            "fixed left-0 z-40 w-72 text-white",
            // ⬇️ pegado al header (~64px). Si aún ves gap, baja a 60px.
            "top-[64px] h-[calc(100vh-64px)]",
            "lg:top-[64px] lg:h-[calc(100vh-64px)]",
            "overflow-visible",
            "transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            BRAND.sidebarBg,
          ].join(" ")}
        >
          <div className="px-5 py-6 lg:py-8">
            <div className="mb-4">
              <div className="text-lg font-semibold text-white">Panel Administrativo</div>
            </div>

            <div className={`my-5 border-t ${BRAND.subtleBorder}`} />

            <nav className="mt-3 space-y-1.5">
              {items.map(({ icon, label, href }) => (
                <NavItem
                  key={href}
                  to={href}
                  icon={icon}
                  label={label}
                  active={isActive(href)}
                />
              ))}
            </nav>

            <div className={`mt-8 border-t ${BRAND.subtleBorder}`} />
           
          </div>
        </aside>

        {/* Contenido: reserva el espacio del sidebar para que no lo tape */}
        <main className="flex-1 p-6 lg:p-8 lg:ml-72">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
