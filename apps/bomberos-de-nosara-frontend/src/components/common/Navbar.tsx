import { Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import UserButton from '../ui/ProfileButton/UserButton.js';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const link =
    "relative px-2 py-2 text-[15px] font-medium text-slate-800 whitespace-nowrap transition-colors duration-200 " +
    "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-red-600 " +
    "after:transition-all after:duration-300 hover:after:w-full hover:text-red-600";

  return (
    <nav
      className={`fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-200 transition-all duration-300 ${
        scrolled ? 'h-16' : 'h-24'
      }`}
      role="navigation"
      aria-label="Main"
    >
      {/* menos padding a la izquierda para acercar todo al borde */}
      <div className="mx-auto max-w-7xl pl-0 pr-4 sm:pl-1 sm:pr-6 lg:pl-2 lg:pr-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* IZQUIERDA: logo */}
          <div className="flex items-center -ml-6 pr-4 lg:pr-8">
            <Link to="/" aria-label="Inicio" className="flex items-center">
              <img
                src="/logo.png"
                alt="Bomberos de Nosara"
                className={`block w-auto object-contain shrink-0 select-none transition-all duration-300 ${
                  scrolled ? 'h-12' : 'h-16 md:h-20 lg:h-20 xl:h-20'
                } -ml-2`}
                draggable={false}
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.onerror = null;
                  img.src = 'https://i.ibb.co/1J8rYnhR/bomberos-de-nosara-firefighters-logo-x2.webp';
                }}
              />
            </Link>
          </div>

          {/* CENTRO: links (mantiene tu estilo + agrega rutas nuevas de tu compañera) */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <ul className="flex items-center gap-8 xl:gap-12">
              <li><Link to="/sobre-nosotros"  className={link}>SOBRE NOSOTROS</Link></li>
              <li><Link to="/nuestro-trabajo" className={link}>NUESTRO TRABAJO</Link></li>
              <li><Link to="/donantes"        className={link}>DONANTES</Link></li>
              <li><Link to="/fotos"           className={link}>FOTOS</Link></li>
              <li><Link to="/sugerencias"     className={link}>SUGERENCIAS</Link></li>
              <li><Link to="/noticias"        className={link}>NOTICIAS</Link></li>
              <li><Link to="/contacto"        className={link}>CONTACTO</Link></li>
              <li><Link to="/donar"           className={link}>DONAR</Link></li>
            </ul>
          </div>

          {/* DERECHA: user + hamburguesa */}
          <div className="flex items-center -mr-3 pl-8 lg:pl-12">
            <UserButton />
            <button
              type="button"
              className="lg:hidden ml-2 inline-flex items-center justify-center p-2 rounded-md text-slate-800 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(v => !v)}
            >
              <span className="sr-only">Abrir menú</span>
              {mobileOpen ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL (incluye también las rutas nuevas) */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
            mobileOpen ? 'max-h-[680px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-slate-200 py-2 bg-white">
            <nav className="flex flex-col">
              <Link to="/sobre-nosotros"  className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>SOBRE NOSOTROS</Link>
              <Link to="/nuestro-trabajo" className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>NUESTRO TRABAJO</Link>
              <Link to="/donantes"        className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>DONANTES</Link>
              <Link to="/fotos"           className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>FOTOS</Link>
              <Link to="/sugerencias"     className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>SUGERENCIAS</Link>
              <Link to="/noticias"        className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>NOTICIAS</Link>
              <Link to="/contacto"        className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>CONTACTO</Link>
              <Link to="/donar"           className="px-4 py-3 text-[16px] text-slate-800 hover:text-red-600" onClick={() => setMobileOpen(false)}>DONAR</Link>
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
}
