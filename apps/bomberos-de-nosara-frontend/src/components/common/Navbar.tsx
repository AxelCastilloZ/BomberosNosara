import { Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import UserButton from '../ui/ProfileButton/UserButton.js';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={`
        w-full z-50 transition-all duration-300 fixed top-0 
        ${scrolled
          ? 'bg-white/30 backdrop-blur-lg shadow-md'
          : 'bg-white'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Bomberos de Nosara"
                className="h-12 w-auto"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = "https://i.ibb.co/1J8rYnhR/bomberos-de-nosara-firefighters-logo-x2.webp";
                }}
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 ml-10">
            <Link to="/sobre-nosotros" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              SOBRE NOSOTROS
            </Link>
            <Link to="/nuestro-trabajo" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              NUESTRO TRABAJO
            </Link>
            <Link to="/donantes" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              DONANTES
            </Link>
            <Link to="/fotos" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              FOTOS
            </Link>
            <Link to="/sugerencias" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              SUGERENCIAS
              </Link>
            <Link to="/noticias" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              NOTICIAS
            </Link>

            <Link to="/contacto" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              CONTACTOS
            </Link>
            

            <Link to="/donar" className="text-gray-700 hover:text-red-600 px-2 py-1 text-sm font-medium border-b-2 border-transparent hover:border-red-600 transition-all">
              DONAR
            </Link>

            <UserButton />

          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
