import { FaFacebookF, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

export default function FooterSection() {
  return (
    <footer
      id="contact"
      className="w-full bg-[#B22222] text-white font-[Poppins]"
    >
      {/* 🔹 Aumentamos el padding superior (pt-8 en lugar de pt-4) */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <h2 className="text-2xl font-semibold leading-snug">
            Asociación Bomberos de Nosara
          </h2>
          <p className="text-gray-100 max-w-sm text-sm md:text-base">
            Garantizamos servicios de emergencia oportunos para la comunidad
            porque, en caso de emergencia,{" "}
            <span className="font-semibold italic">¡cada segundo cuenta!</span>
          </p>

          {/* Redes sociales */}
          <div className="flex space-x-3 mt-2">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#B22222] p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaFacebookF size={16} />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#B22222] p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaInstagram size={16} />
            </a>
          </div>
        </div>

        {/* Espaciador central */}
        <div></div>

        {/* Columna derecha */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
          <h3 className="text-lg font-semibold">Contáctanos</h3>

          <p className="flex items-center gap-2">
            <FaPhone className="text-white" />
            <a
              href="tel:+50687090614"
              className="underline hover:text-gray-200 text-sm md:text-base"
            >
              +506 8709 0614
            </a>
          </p>

          <p className="flex items-center gap-2">
            <FaEnvelope className="text-white" />
            <a
              href="mailto:info@bomberosnosara.org"
              className="underline hover:text-gray-200 text-sm md:text-base"
            >
              info@bomberosnosara.org
            </a>
          </p>

          <motion.a
            href="tel:+50687090614"
            className="bg-white text-[#B22222] font-bold px-5 py-2 rounded-md shadow flex items-center space-x-2 hover:bg-gray-100 transition text-sm md:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>📞</span>
            <span>Llamar +506 8709 0614</span>
          </motion.a>
        </div>
      </div>

      {/* 🔹 Más padding inferior para ocupar mejor el espacio */}
      <div className="w-full border-t border-[#8B1B1B] mt-2">
        <p className="text-center text-xs sm:text-sm text-gray-200 py-3">
          © {new Date().getFullYear()} Bomberos de Nosara. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
