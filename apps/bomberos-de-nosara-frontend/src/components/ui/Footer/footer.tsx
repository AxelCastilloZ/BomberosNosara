import { Facebook, Instagram, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../ui/button";
import Logo1 from "../../../images/Logo1.png";

export default function FooterSection() {
  return (
    <footer className="bg-[#0A0A0A] text-white font-[Poppins]">
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Columna izquierda - Información */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={Logo1}
                alt="Bomberos de Nosara"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight text-white">
                BOMBEROS DE NOSARA
              </h3>
              <p className="text-sm text-gray-400">
                THE VOLUNTEER FIREFIGHTERS OF NOSARA
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">
              Asociación Bomberos de Nosara
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Garantizamos servicios de emergencia oportunos para la comunidad,
              porque en caso de emergencia,{" "}
              <span className="font-semibold text-red-500">
                ¡cada segundo cuenta!
              </span>
            </p>
          </div>

          {/* Redes Sociales */}
          <div className="flex gap-3 pt-2">
            <a
              href="https://www.facebook.com/bomberosdenosara"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-red-800 text-white font-medium rounded-3xl hover:bg-red-700 transition flex items-center justify-center shadow-md hover:shadow-lg"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/bomberosdenosara/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-red-800 text-white font-medium rounded-3xl hover:bg-red-700 transition flex items-center justify-center shadow-md hover:shadow-lg"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Columna derecha - Contacto (pegada al borde derecho) */}
        <div className="flex justify-end">
          <div className="space-y-6 w-full max-w-sm text-left">
            <h4 className="text-lg font-semibold text-white">Contáctanos</h4>

            <div className="space-y-4">
              <a
                href="tel:+50687090614"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 bg-red-800 text-white font-medium rounded-3xl hover:bg-red-700 transition flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-medium">+506 8709 0614</span>
              </a>

              <a
                href="mailto:info@bomberosnosara.org"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 bg-red-800 text-white font-medium rounded-3xl hover:bg-red-700 transition flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-medium">info@bomberosnosara.org</span>
              </a>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="w-full px-4 py-3 bg-red-800 text-white font-medium rounded-3xl hover:bg-red-700 transition shadow-md hover:shadow-lg"
                size="lg"
                onClick={() => (window.location.href = 'tel:+50687090614')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Llamar +506 8709 0614
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Franja inferior */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Bomberos de Nosara. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
