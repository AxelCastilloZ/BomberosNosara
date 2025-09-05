import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { useLayout } from '../../context/LayoutContext';
import { useState, useEffect, useRef } from 'react';
import UserButton from '../ui/ProfileButton/UserButton.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBars, FaChevronLeft } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

// Navigation links data
const navLinks=[
  { to: "/sobre-nosotros", label: "SOBRE NOSOTROS" },
  { to: "/nuestro-trabajo", label: "NUESTRO TRABAJO" },
  { to: "/donantes", label: "DONANTES" },
  { to: "/noticias", label: "NOTICIAS" },
  { to: "/donar", label: "DONAR" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen]=useState(false);
  const [scrolled, setScrolled]=useState(false);
  const [isClient, setIsClient]=useState(false);
  const navRef=useRef<HTMLElement>(null);
  const { location }=useRouterState();
  const navigate=useNavigate();
  const { isAuthenticated, logout }=useAuth();
  const { isSidebarCollapsed }=useLayout();

  // Get the current route name for the header title
  const getHeaderTitle=() => {
    const path=location.pathname.toLowerCase();

    // Define route to title mappings
    const routeTitles: Record<string, string>={
      '/admin': 'Panel Administrativo',
      '/admin/usuarios': 'Gestión de Usuarios',
      '/admin/chat': 'Chat Interno',
      '/admin/noticias': 'Gestión de Noticias',
      '/admin/donaciones': 'Donaciones',
      '/admin/estadisticas': 'Estadísticas',
      '/admin/ajustes': 'Ajustes'
    };

    // Find a matching route or return a default
    return Object.entries(routeTitles).find(([route]) =>
      path.startsWith(route)
    )?.[1]||'Panel de Administración';
  };

  // Set isClient to true after component mounts (for SSR compatibility)
  useEffect(() => {
    setIsClient(true);
    const handleScroll=() => setScrolled(window.scrollY>10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside=(event: MouseEvent) => {
      if (navRef.current&&!navRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isClient) {
      if (mobileOpen) {
        document.body.style.overflow='hidden';
      } else {
        document.body.style.overflow='auto';
      }
    }
  }, [mobileOpen, isClient]);

  // Base styles
  const navItemBase="relative px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200";
  const mobileNavItem="block px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900";
  const ctaButton="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200";

  // For authenticated users, show header with title and actions
  if (isAuthenticated) {
    const isAdminRoot=location.pathname==='/admin';
    // On admin root, take full width, otherwise respect sidebar state
    const widthClass=isAdminRoot
      ? 'w-full'
      :isSidebarCollapsed
        ? 'w-[calc(100%-4rem)] ml-16'
        :'w-[calc(100%-16rem)] ml-64';

    return (
      <nav
        className={`fixed top-0 right-0 z-40 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 transition-all duration-300 ${widthClass}`}
      >
        <div className="flex items-center">
          {!isAdminRoot&&(
            <button
              onClick={() => navigate({ to: '/admin' })}
              className="flex items-center text-gray-700 hover:text-gray-900 mr-4"
              aria-label="Volver al panel"
            >
              <FaChevronLeft className="mr-2" />
            </button>
          )}
          <h1 className={`text-lg font-semibold text-gray-800 ${isAdminRoot? 'ml-4':''}`}>
            {getHeaderTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              logout();
              navigate({ to: '/' });
            }}
            className="text-sm font-medium text-gray-700 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    );
  }

  // For non-authenticated users, show the full navigation
  return (
    <nav
      ref={navRef}
      className={`fixed top-0 w-full z-50 bg-white shadow-sm transition-all duration-300 ${scrolled? 'h-16':'h-20'
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" aria-label="Inicio" className="flex items-center">
              <img
                src="/logo.png"
                alt="Bomberos de Nosara"
                className={`block h-12 w-auto transition-all duration-300 ${scrolled? 'h-10':'h-12'
                  }`}
                draggable={false}
                decoding="async"
                onError={(e) => {
                  const img=e.currentTarget as HTMLImageElement;
                  img.onerror=null;
                  img.src='https://i.ibb.co/1J8rYnhR/bomberos-de-nosara-firefighters-logo-x2.webp';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`${navItemBase} ${location.pathname===link.to? 'text-red-600':''
                  }`}
                activeOptions={{ exact: link.to==='/' }}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-4">
              <UserButton />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <UserButton />
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="sr-only">{mobileOpen? 'Cerrar menú':'Abrir menú'}</span>
              {mobileOpen? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ):(
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen&&(
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${mobileNavItem} ${location.pathname===link.to? 'bg-gray-50 text-red-600':''
                    }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
