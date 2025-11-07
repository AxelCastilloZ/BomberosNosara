import { FaFacebookF, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

export default function FooterSection() {
  return (
    <footer
      id="contact"
      className="w-full bg-[#B22222] text-white font-[Poppins] border-t border-[#8B1B1B]"
    >
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Columna izquierda */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <img
            src="/logo.png"
            alt="Bomberos de Nosara"
            className="h-20 w-auto"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src =
                "https://i.ibb.co/1J8rYnhR/bomberos-de-nosara-firefighters-logo-x2.webp";
            }}
          />

          <h2 className="text-2xl font-bold leading-snug text-white">
            Asociación Bomberos de Nosara
          </h2>

          <p className="text-gray-100 max-w-sm leading-relaxed">
            Garantizamos servicios de emergencia oportunos para la comunidad
            porque, en caso de emergencia, <strong>¡cada segundo cuenta!</strong>
          </p>

          {/* Redes sociales */}
          <div className="flex space-x-3 mt-3">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#B22222] p-2 rounded-full hover:bg-gray-100 transition duration-300 shadow-md"
            >
              <FaFacebookF size={16} />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#B22222] p-2 rounded-full hover:bg-gray-100 transition duration-300 shadow-md"
            >
              <FaInstagram size={16} />
            </a>
          </div>
        </div>

        {/* Columna vacía (espaciador visual en pantallas grandes) */}
        <div className="hidden md:block"></div>

        {/* Columna derecha */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <h3 className="text-lg font-semibold text-white">Contáctanos</h3>

          <p className="flex items-center gap-2">
            <FaPhone className="text-white" />
            <a
              href="tel:+50687090614"
              className="underline hover:text-gray-200 transition"
            >
              +506 8709 0614
            </a>
          </p>

          <p className="flex items-center gap-2">
            <FaEnvelope className="text-white" />
            <a
              href="mailto:info@bomberosnosara.org"
              className="underline hover:text-gray-200 transition"
            >
              info@bomberosnosara.org
            </a>
          </p>

          <motion.a
            href="tel:+50687090614"
            className="bg-white text-[#B22222] font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 hover:bg-gray-100 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📞 <span>Llamar +506 8709 0614</span>
          </motion.a>
        </div>
      </div>

      {/* Línea divisoria y copyright */}
      <div className="w-full border-t border-[#8B1B1B] mt-8">
        <p className="text-center text-sm text-gray-200 py-4">
          © {new Date().getFullYear()} Bomberos de Nosara. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
