import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ReactNode, useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  FaBars,
  FaBook,
  FaChartBar,
  FaChevronRight,
  FaComments,
  FaHome,
  FaRegNewspaper,
  FaSignOutAlt,
  FaTimes,
  FaTruck,
  FaUserShield,
  FaUsers,
  FaWrench,
  FaHandshake,
} from "react-icons/fa";
import { getUserRoles } from "../../../service/auth";
import { RoleEnum } from "../../../types/role.enum";
import React from "react";
import { useAuth } from "../../../hooks/useAuth";

type SidebarItem = {
  icon: ReactNode;
  label: string;
  href: string;
  roles: RoleEnum[];
};

const ALL_ITEMS: SidebarItem[] = [
  { icon: <FaHome />, label: "Dashboard", href: "/admin", roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL, RoleEnum.VOLUNTARIO] },
  { icon: <FaUserShield />, label: "Administrar Donantes", href: "/admin/donantes", roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN] },
  { icon: <FaUsers />, label: "Gestión de Usuarios", href: "/admin/usuarios", roles: [RoleEnum.SUPERUSER] },
  { icon: <FaTruck />, label: "Inventario de Vehículos", href: "/admin/vehiculos", roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL] },
  { icon: <FaWrench />, label: "Inventario de Equipo", href: "/admin/equipo", roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL] },
  { icon: <FaRegNewspaper />, label: "Noticias", href: "/admin/noticias", roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN] },
  { icon: <FaHandshake />, label: "Registro Voluntarios", href: "/admin/registro-horas", roles: [RoleEnum.VOLUNTARIO] },
  { icon: <FaHandshake />, label: "Gestión Voluntarios", href: "/admin/voluntarios", roles: [RoleEnum.SUPERUSER] },
  { icon: <FaBook />, label: "Material Interno", href: "", roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL, RoleEnum.VOLUNTARIO] },
  { icon: <FaComments />, label: "Chat Interno", href: "/admin/chat", roles: [RoleEnum.SUPERUSER, RoleEnum.ADMIN, RoleEnum.PERSONAL_BOMBERIL, RoleEnum.VOLUNTARIO] },
];

const BRAND = {
  itemBase: "group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 hover:text-gray-900 transition-all duration-200 ease-out",
  itemHover: "hover:bg-gray-50 hover:pl-4 sm:hover:pl-5",
  itemActive: "bg-gray-100 text-gray-900 border-l-4 border-red-600 pl-3 sm:pl-4 font-medium",
};

// Componentes memoizados para mejor rendimiento
const SidebarHeader = React.memo(({ isCollapsed, setCollapsed, setOpen }: {
  isCollapsed: boolean;
  setCollapsed: (value: boolean) => void;
  setOpen: (value: boolean) => void;
}) => (
  <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
    <div className="flex items-center gap-3">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS3AApsPrmFD1mfS8zMR7ck1OhZrq5bA7yHQ&s"
        alt="Bomberos Nosara"
        className="w-8 h-8 rounded-lg"
      />
      {!isCollapsed && (
        <span className="text-lg font-semibold text-gray-900 truncate">
          Bomberos Nosara
        </span>
      )}
    </div>

    {/* Botón colapsar (desktop) */}
    <button
      onClick={() => setCollapsed(!isCollapsed)}
      className="hidden lg:flex p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
    >
      <FaChevronRight
        className={`w-4 h-4 transition-transform ${
          isCollapsed ? "" : "rotate-180"
        }`}
      />
    </button>

    {/* Botón cerrar (solo móvil) */}
    <button
      onClick={() => setOpen(false)}
      className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      aria-label="Cerrar menú"
    >
      <FaTimes className="w-4 h-4" />
    </button>
  </div>
));

const SidebarFooter = React.memo(({ isCollapsed, username, userRoles, handleLogout }: {
  isCollapsed: boolean;
  username: string;
  userRoles: RoleEnum[];
  handleLogout: () => void;
}) => {
  // Obtener iniciales del username
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : (userRoles[0]?.charAt(0) || "U");

  if (isCollapsed) {
    return (
      <div className="border-t border-gray-200 py-3 flex flex-col items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-md text-red-600 hover:bg-red-50"
          title="Cerrar sesión"
        >
          <FaSignOutAlt className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 shrink-0">
      <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {username || "Usuario"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {userRoles[0] || "Sin rol"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 p-2 rounded-md text-red-600 hover:bg-red-50"
          title="Cerrar sesión"
        >
          <FaSignOutAlt className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default function AdminLayout() {
  const { user } = useAuth();

  const userRoles = useMemo(() => {
    try {
      return getUserRoles();
    } catch {
      return [];
    }
  }, []);

  const username = user?.username || user?.name || user?.email?.split('@')[0] || "Usuario";

  const items = useMemo(() => {
    return ALL_ITEMS
      .filter((i) => i.roles.some((r) => userRoles.includes(r)))
      .map((i) => {
        if (i.label === "Material Interno") {
          if (userRoles.includes(RoleEnum.SUPERUSER) || userRoles.includes(RoleEnum.ADMIN)) {
            return { ...i, href: "/admin/material-interno" };
          }
          return { ...i, href: "/admin/material-voluntarios" };
        }
        return i;
      });
  }, [userRoles]);

  const { location } = useRouterState();
  const navigate = useNavigate();

  const [isCollapsed, setCollapsedState] = useState(false);
  const [open, setOpenState] = useState(window.innerWidth >= 1024);

  const setCollapsed = useCallback((value: boolean) => {
    if (window.innerWidth >= 1024) setCollapsedState(value);
  }, []);

  const setOpen = useCallback((value: boolean) => {
    if (window.innerWidth < 1024) setOpenState(value);
    else setOpenState(true);
  }, []);

  // ✅ Ajusta automáticamente el sidebar al redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(true);
      } else {
        setOpen(false);
        setCollapsedState(false);
      }
    };
    handleResize();

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDashboard = location.pathname === "/admin";
  const showSidebar = !isDashboard;
  const needsFullHeight = location.pathname.startsWith("/admin/chat");

  const isActive = useCallback((href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate({ to: "/login" });
  }, [navigate]);

  // ✅ Cierra el sidebar al hacer clic fuera (en móvil)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node) && window.innerWidth < 1024) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 🔹 Botón hamburguesa (solo móvil) */}
      {showSidebar && (
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-white border border-gray-200 p-2 rounded-md shadow-md text-gray-700"
        >
          <FaBars className="w-5 h-5" />
        </button>
      )}

      {/* 🔹 Overlay oscuro cuando el menú está abierto en móvil */}
      {open && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {showSidebar && (
          <motion.aside
            ref={sidebarRef}
            className={`
              bg-white border-r border-gray-200 flex flex-col justify-between
              ${isCollapsed ? "w-16" : "w-64"}
              ${open ? "translate-x-0" : "-translate-x-full"}
              fixed lg:sticky top-0 left-0 z-40
              h-screen
            `}
            animate={{
              x: open ? 0 : "-100%",
              width: isCollapsed ? "4rem" : "16rem",
            }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <SidebarHeader isCollapsed={isCollapsed} setCollapsed={setCollapsed} setOpen={setOpen} />

            {/* 🔹 Menú principal */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-0.5">
              {!isCollapsed && (
                <div className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-gray-500">
                  MENÚ PRINCIPAL
                </div>
              )}
              {items.map(({ icon, label, href }) => (
                <li
                  key={href || label}
                  className={`relative ${isCollapsed ? "flex justify-center" : ""}`}
                >
                  <Link
                    to={href}
                    className={`${BRAND.itemBase} ${BRAND.itemHover} ${
                      isActive(href) ? BRAND.itemActive : ""
                    } ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? label : ""}
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-lg">{icon}</span>
                    {!isCollapsed && <span className="font-medium text-sm">{label}</span>}
                  </Link>
                </li>
              ))}
            </div>

            <SidebarFooter isCollapsed={isCollapsed} username={username} userRoles={userRoles} handleLogout={handleLogout} />
          </motion.aside>
        )}

        {/* 🔹 Contenido principal */}
        <motion.main
          className={`flex-1 p-2 sm:p-3 md:p-4 w-full transition-all duration-300 ${
            showSidebar
              ? window.innerWidth >= 1024
                ? "" // 🧱 en pantallas grandes el sidebar es estático, sin margen
                : "ml-0"
              : ""
          }`}
        >

          <div className="w-full max-w-full 2xl:max-w-7xl mx-auto">
            <div
              className={[
                isDashboard
                  ? "bg-transparent border-0 shadow-none"
                  : "bg-white border border-gray-200 shadow-sm",
                "rounded-lg w-full",
                needsFullHeight
                  ? "min-h-[calc(100vh-4rem)] overflow-visible flex"
                  : "overflow-hidden",
              ].join(" ")}
            >
              <Outlet />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
