import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  FaUserShield, FaUsers, FaTruck, FaChartBar,
  FaComments, FaBook, FaHome, FaBars, FaTimes, FaChevronRight
} from "react-icons/fa";
import { getUserRoles } from "../../../service/auth";
import { useLayout } from '../../../context/LayoutContext';
import { motion, AnimatePresence } from "framer-motion";

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
  { icon: <FaChartBar />, label: "Estadísticas", href: "/admin/estadisticas", roles: ["SUPERUSER", "ADMIN"] },
  { icon: <FaBook />, label: "Material Interno", href: "/admin/material-interno", roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL", "VOLUNTARIO"] },
  { icon: <FaComments />, label: "Chat Interno", href: "/admin/chat", roles: ["SUPERUSER", "ADMIN", "PERSONAL_BOMBERIL", "VOLUNTARIO"] },
  { icon: <FaComments />, label: "Sugerencias", href: "/admin/sugerencias", roles: ["SUPERUSER", "ADMIN"] },
];

/** Design System */
const BRAND={
  // Colors - Updated to match main app
  sidebarBg: "bg-white border-r border-gray-200",
  subtleBorder: "border-gray-200",

  // Typography
  sectionTitle: "text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 py-2",

  // Navigation Items
  itemBase: "group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 hover:text-gray-900 transition-all duration-200 ease-out",
  itemHover: "hover:bg-gray-50 hover:pl-4 sm:hover:pl-5",
  itemActive: "bg-gray-100 text-gray-900 border-l-4 border-red-600 pl-3 sm:pl-4 font-medium",

  // Card Styles
  card: "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full",
  cardHeader: "px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between",
  cardTitle: "text-base sm:text-lg font-semibold text-gray-800",
  cardContent: "p-4 sm:p-6",

  // Shadows
  shadow: "shadow-sm",

  // Transitions
  transition: "all 0.2s ease-in-out"
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
    <motion.li
      className="relative"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={to}
        className={`${BRAND.itemBase} ${BRAND.itemHover} ${active? BRAND.itemActive:""
          }`}
        activeOptions={{ exact: false }}
      >
        <span className="text-lg">
          {icon}
        </span>
        <span className="font-medium text-sm">{label}</span>
      </Link>
    </motion.li>
  );
}

export default function AdminLayout() {
  const userRoles=useMemo(() => getUserRoles(), []);
  const items=useMemo(
    () => ALL_ITEMS.filter(i => i.roles.some(r => userRoles.includes(r))),
    [userRoles]
  );

  const { location }=useRouterState();
  const {
    isSidebarCollapsed: isCollapsed,
    isMobileMenuOpen: open,
    toggleSidebar,
    setMobileMenuOpen: setOpen
  }=useLayout();
  const sidebarRef=useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(true);
  }, [location.pathname, setOpen]);

  // ocultar sidebar solo en /admin (dashboard)
  const isAdminHome=location.pathname==="/admin";

  // ✅ Dashboard activo solo en /admin exacto; resto permite subrutas
  const isActive=(href: string) => {
    if (href==="/admin") {
      return location.pathname==="/admin";
    }
    return (
      location.pathname===href||
      location.pathname.startsWith(href+"/")
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
      {/* Mobile Header */}
      <motion.header
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200 shadow-sm"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-800">Panel Administrativo</h2>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

      {/* Mobile Menu Backdrop */}
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

      <div className="flex min-h-screen">
        {/* Desktop Sidebar Toggle */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-30 w-16 bg-white border-r border-gray-200">
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <img className="w-8 h-8  rounded-lg flex items-center justify-center text-white font-bold" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS3AApsPrmFD1mfS8zMR7ck1OhZrq5bA7yHQ&s" alt="" />
          </div>
          <div className="py-4 space-y-2">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-center py-3 text-gray-600 hover:text-red-600 transition-colors"
              aria-label={open? "Contraer menú":"Expandir menú"}
            >
              <FaBars className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <motion.aside
          ref={sidebarRef}
          className={`fixed left-0 z-40 bg-white border-r border-gray-200 ${isCollapsed? 'w-16':'w-64'
            } ${open? 'translate-x-0':'-translate-x-full lg:translate-x-16'}`}
          initial={{ x: '-100%' }}
          animate={{
            x: open? 0:'-100%',
            width: isCollapsed? '4rem':'16rem'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            height: '100vh',
            top: 0,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS3AApsPrmFD1mfS8zMR7ck1OhZrq5bA7yHQ&s" alt="" />
              {!isCollapsed&&(
                <span className="text-lg font-semibold text-gray-900 truncate">Bomberos Nosara</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleSidebar}
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

          <div className="p-2 sm:p-3 space-y-0.5">
            {!isCollapsed&&(
              <div className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-gray-500">
                MENÚ PRINCIPAL
              </div>
            )}
            {items.map(({ icon, label, href }, index) => (
              <motion.li
                className={`relative ${isCollapsed? 'flex justify-center':''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={href}
                  className={`${BRAND.itemBase} ${BRAND.itemHover} ${isActive(href)? BRAND.itemActive:''
                    } ${isCollapsed? 'justify-center':''}`}
                  activeOptions={{ exact: false }}
                  title={isCollapsed? label:''}
                >
                  <span className="text-lg">{icon}</span>
                  {!isCollapsed&&(
                    <span className="font-medium text-sm">{label}</span>
                  )}
                </Link>
              </motion.li>
            ))}
          </div>

          {!isCollapsed&&(
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {userRoles[0]?.charAt(0)||'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userRoles[0]||'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Administrador</p>
                </div>
              </div>
            </div>
          )}
        </motion.aside>

        {/* Main Content */}
        <motion.main
          className={`flex-1 p-2 sm:p-3 md:p-4 w-full transition-all duration-300 ${open
            ? isCollapsed
              ? 'lg:ml-16'
              :'lg:ml-64'
            :'lg:ml-16'
            }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-full max-w-full 2xl:max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
              <Outlet />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
