// src/components/ui/Layout/AdminLayout.tsx
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useMemo, useRef, useState } from "react";
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
} from "react-icons/fa";
import { getUserRoles } from "../../../service/auth";
import React from "react";

type SidebarItem={
  icon: ReactNode;
  label: string;
  href: string;
  roles: string[];
};

const ALL_ITEMS: SidebarItem[]=[
  { icon: <FaHome />, label: "Dashboard", href: "/admin", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaUserShield />, label: "Administrar Donantes", href: "/admin/donantes", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaUsers />, label: "Gestión de Usuarios", href: "/admin/usuarios", roles: ["SUPERUSER"] },
  { icon: <FaTruck />, label: "Inventario de Vehículos", href: "/admin/vehiculos", roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL"] },
  { icon: <FaWrench />, label: "Inventario de Equipo", href: "/admin/equipo", roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL"] },
  { icon: <FaRegNewspaper />, label: "Noticias", href: "/admin/noticias", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaChartBar />, label: "Estadísticas", href: "/admin/estadisticas", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaBook />, label: "Material Interno", href: "/admin/material-interno", roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL", "VOLUNTARIO"] },
  { icon: <FaComments />, label: "Chat Interno", href: "/admin/chat", roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL", "VOLUNTARIO"] },
];

const BRAND={
  itemBase:
    "group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 hover:text-gray-900 transition-all duration-200 ease-out",
  itemHover: "hover:bg-gray-50 hover:pl-4 sm:hover:pl-5",
  itemActive:
    "bg-gray-100 text-gray-900 border-l-4 border-red-600 pl-3 sm:pl-4 font-medium",
};

export default function AdminLayout() {
  const userRoles=useMemo(() => {
    try {
      const roles=getUserRoles();
      console.log("👤 Roles obtenidos en AdminLayout:", roles);
      return roles;
    } catch (error) {
      console.error("❌ Error obteniendo roles:", error);
      return [];
    }
  }, []);

  const items=useMemo(() => {
    const filteredItems=ALL_ITEMS.filter((i) =>
      i.roles.some((r) => userRoles.includes(r))
    );
    console.log("📋 Items filtrados para el usuario:", filteredItems);
    return filteredItems;
  }, [userRoles]);

  const { location }=useRouterState();
  const navigate=useNavigate();

  const [isCollapsed, setCollapsedState]=useState<boolean>(false);
  const [open, setOpenState]=useState<boolean>(true);

  const setCollapsed=(value: boolean) => {
    if (window.innerWidth>=1024) {
      setCollapsedState(value);
    }
  };

  const setOpen=(value: boolean) => {
    if (window.innerWidth<1024) {
      setOpenState(value);
    } else {
      setOpenState(true);
    }
  };

  React.useEffect(() => {
    const handleResize=() => {
      if (window.innerWidth>=1024) {
        setOpen(true);
      } else if (open) {
        setCollapsedState(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  const sidebarRef=useRef<HTMLDivElement>(null);

  const isDashboard=location.pathname==="/admin";
  const showSidebar=!isDashboard;
  const needsFullHeight=location.pathname.startsWith("/admin/chat");

  const isActive=(href: string) => {
    if (href==="/admin") return location.pathname==="/admin";
    return (
      location.pathname===href||location.pathname.startsWith(href+"/")
    );
  };

  const handleLogout=() => {
    console.log("🚪 Cerrando sesión...");
    localStorage.clear();
    sessionStorage.clear();
    navigate({ to: "/login" });
  };

  console.log("🔍 Estado actual AdminLayout:", {
    currentPath: location.pathname,
    userRoles,
    itemsCount: items.length,
    showSidebar,
    isDashboard,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar&&(
        <motion.header
          className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200 shadow-sm"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Panel Administrativo
          </h2>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            aria-label={open? "Cerrar menú":"Abrir menú"}
            aria-expanded={open}
          >
            {open? (
              <FaTimes className="w-5 h-5 text-gray-600" />
            ):(
              <FaBars className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </motion.header>
      )}

      {showSidebar&&(
        <AnimatePresence>
          {open&&(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>
      )}

      <div className="flex min-h-screen">
        {showSidebar&&(
          <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-30 w-16 bg-white border-r border-gray-200">
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
              <img
                className="w-8 h-8 rounded-lg"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS3AApsPrmFD1mfS8zMR7ck1OhZrq5bA7yHQ&s"
                alt="BN"
              />
            </div>
            <div className="py-4 space-y-2">
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-center py-3 text-gray-600 hover:text-red-600"
                aria-label={open? "Contraer menú":"Expandir menú"}
              >
                <FaBars className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {showSidebar&&(
          <motion.aside
            ref={sidebarRef}
            className={`fixed left-0 z-40 bg-white border-r border-gray-200 flex flex-col
              ${isCollapsed? "w-16":"w-64"}
              ${open? "translate-x-0":"-translate-x-full lg:translate-x-16"}`}
            initial={{ x: "-100%" }}
            animate={{
              x: open? 0:"-100%",
              width: isCollapsed? "4rem":"16rem",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ height: "100vh", top: 0 }}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  className="w-8 h-8 rounded-lg"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS3AApsPrmFD1mfS8zMR7ck1OhZrq5bA7yHQ&s"
                  alt="BN"
                />
                {!isCollapsed&&(
                  <span className="text-lg font-semibold text-gray-900 truncate">
                    Bomberos Nosara
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCollapsed(!isCollapsed)}
                  className="hidden lg:flex p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label={isCollapsed? "Expandir menú":"Contraer menú"}
                >
                  {isCollapsed? (
                    <FaChevronRight className="w-4 h-4" />
                  ):(
                    <FaChevronRight className="w-4 h-4 transform rotate-180" />
                  )}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Cerrar menú"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-0.5">
              {!isCollapsed&&(
                <div className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-gray-500">
                  MENÚ PRINCIPAL
                </div>
              )}
              {items.map(({ icon, label, href }) => (
                <motion.li
                  key={href}
                  className={`relative ${isCollapsed? "flex justify-center":""}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={href}
                    className={`${BRAND.itemBase} ${BRAND.itemHover} ${isActive(href)? BRAND.itemActive:""
                      } ${isCollapsed? "justify-center":""}`}
                    title={isCollapsed? label:""}
                    onClick={() => {
                      console.log(`🔗 Navegando a: ${href}`);
                      setOpen(false);
                    }}
                  >
                    <span className="text-lg">{icon}</span>
                    {!isCollapsed&&(
                      <span className="font-medium text-sm">{label}</span>
                    )}
                  </Link>
                </motion.li>
              ))}
            </div>

            {isCollapsed? (
              <div className="border-t border-gray-200 py-3 flex flex-col items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-semibold">
                  {userRoles[0]?.charAt(0)||"U"}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-red-600 hover:bg-red-50"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                </button>
              </div>
            ):(
              <div className="p-4 border-t border-gray-200 shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium">
                    {userRoles[0]?.charAt(0)||"U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userRoles[0]||"Usuario"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Administrador
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="shrink-0 p-2 rounded-md text-red-600 hover:bg-red-50"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        )}

        <motion.main
          className={`flex-1 p-2 sm:p-3 md:p-4 w-full transition-all duration-300 ${showSidebar? (isCollapsed? "lg:ml-16":"lg:ml-64"):"lg:ml-0"
            }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-full max-w-full 2xl:max-w-7xl mx-auto">
            <div
              className={[
                isDashboard
                  ? "bg-transparent border-0 shadow-none"
                  :"bg-white border border-gray-200 shadow-sm",
                "rounded-lg w-full",
                needsFullHeight
                  ? "min-h-[calc(100vh-4rem)] overflow-visible flex"
                  :"overflow-hidden",
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
