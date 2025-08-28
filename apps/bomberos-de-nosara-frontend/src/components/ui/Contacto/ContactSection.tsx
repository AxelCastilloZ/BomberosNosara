import PhoneButton from "./PhoneButton";
import HeroContact from "./HeroContact";
import { contactParagraphs } from "../../../data/contactData";

import { FaFacebookF, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <footer
      id="contact"
      className="w-full bg-red-800 text-white px-6 pt-12 pb-2"
    >
      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna izquierda */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <img
            src="/logo.png"
            alt="Bomberos de Nosara"
            className="h-20 w-auto "
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src =
                "https://i.ibb.co/1J8rYnhR/bomberos-de-nosara-firefighters-logo-x2.webp";
            }}
          />
          <h2 className="text-2xl font-light leading-snug">
            Asociación Bomberos de Nosara
          </h2>
          <p className="text-gray-100 max-w-xs">
            Ayudamos a garantizar servicios de emergencia oportunos para la comunidad porque, en caso de emergencia, ¡cada segundo cuenta!
          </p>
          <div className="flex space-x-3 mt-2">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-red-700 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaFacebookF size={16} />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-red-700 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaInstagram size={16} />
            </a>
          </div>
        </div>

        {/* Columna centro vacía */}
        <div></div>

        {/* Columna derecha (Contactos) */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <h3 className="text-lg font-semibold">Contáctanos</h3>
        <p className="flex items-center gap-2">
          <FaPhone className="text-white" />
          <span>
            Teléfono:{" "}
            <a
              href="tel:+50687090614"
              className="underline hover:text-gray-200"
            >
              +506 8709 0614
            </a>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <FaEnvelope className="text-white" />
          <span>
            Email:{" "}
            <a
              href="mailto:info@bomberosnosara.org"
              className="underline hover:text-gray-200"
            >
              info@bomberosnosara.org
            </a>
          </span>
        </p>
        <motion.a
          href="tel:+50687090614"
          className="bg-white text-red-700 font-bold px-6 py-3 rounded-md shadow flex items-center space-x-2 hover:bg-gray-100 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>📞</span>
          <span>Llamar +506 8709 0614</span>
        </motion.a>
      </div>


      </div>

      {/* Línea divisoria y copyright */}
      <div className="w-full mt-8">
        <hr className="border-t border-red-300 w-full" />
        <p className="text-center text-sm text-gray-200 mt-2">
          © {new Date().getFullYear()} Bomberos de Nosara. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
