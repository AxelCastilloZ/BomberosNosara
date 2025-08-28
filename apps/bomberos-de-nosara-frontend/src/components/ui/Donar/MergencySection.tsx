// components/ui/Donar/EmergencyCTASection.tsx
import { WhatsAppDonationButton } from './WhatsAppDonationButton';

export const EmergencyCTASection = () => (
  <section className="bg-gradient-to-b from-gray-900 to-black text-white py-20 sm:py-28 lg:py-32">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold mb-6">
        Cada Segundo Cuenta en una Emergencia
      </h2>
      
      <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
        Tu donación nos permite estar preparados cuando más se nos necesita. Únete a nuestra misión de proteger y servir a la comunidad de Nosara.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="#tipos-de-donacion"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 inline-block"
        >
          Hacer una Donación
        </a>
        
        <WhatsAppDonationButton donationType="información general">
          <span className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 inline-block">
            Conocer Más
          </span>
        </WhatsAppDonationButton>
      </div>
    </div>
  </section>
);