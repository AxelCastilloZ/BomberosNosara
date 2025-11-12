import { Mail, Phone, HandCoins } from "lucide-react";

export const DonationDetails = () => {
  return (
    <section className="bg-white text-center text-[#2e2e2e] font-[Poppins]">
      <div className="flex flex-col lg:flex-row">
        <img
          src="https://i.ibb.co/TxG7d8Lp/image-Estructura-organizativa.webp"
          alt="Reunión Bomberos"
          className="w-full lg:w-1/3 object-cover"
        />
        <div className="w-full lg:w-1/3 flex flex-col justify-center items-center p-8">
          <div className="bg-red-800 backdrop-blur-sm border border-white/30 rounded-full w-24 h-24 flex items-center justify-center mb-6 text-white">
            <HandCoins size={40} />
          </div>
          <h2 className="text-3xl font-semibold mb-4 leading-tight text-gray-800">
            Donación Deducible de Impuestos
          </h2>
          <p className="max-w-md mx-auto mb-2 text-gray-700">
            Los donantes con empresas con sede en Costa Rica que deseen hacer una donación deducible de impuestos deben enviarnos un correo electrónico a:
          </p>
          <p className="font-medium text-red-800">
            donaciones@bomberosdenosara.org
          </p>
        </div>
        <img
          src="https://i.ibb.co/fVycDtCg/OIP.webp"
          alt="Incendio Bomberos"
          className="w-full lg:w-1/3 object-cover"
        />
      </div>

      <div className="flex flex-col lg:flex-row text-center">
        <div className="w-full lg:w-1/3 p-10">
          <div className="bg-red-800 backdrop-blur-sm border border-white/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 text-white">
            <Phone size={40} />
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Contacto de Emergencia</h3>
          <p className="max-w-xs mx-auto text-gray-700">
            Para emergencias, póngase en contacto con nuestro teléfono de servicio{" "}
            <span className="font-medium text-red-800">+506 8709 0614</span>
          </p>
        </div>

        <img
          src="https://i.ibb.co/WpYyjM1j/OIP-1.webp"
          alt="Incendio controlado"
          className="w-full lg:w-1/3 object-cover"
        />

        <div className="w-full lg:w-1/3 p-10">
          <div className="bg-red-800 backdrop-blur-sm border border-white/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 text-white">
            <Mail size={40} />
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Dona Ahora</h3>
          <p className="max-w-xs mx-auto text-gray-700">
            Desde 2009, Bomberos de Nosara ha ayudado a la comunidad en emergencias como incendios, rescates y accidentes vehiculares.
            Los bomberos voluntarios de Nosara no reciben fondos del gobierno y dependen de las donaciones de la comunidad.
          </p>
        </div>
      </div>
    </section>
  );
};
