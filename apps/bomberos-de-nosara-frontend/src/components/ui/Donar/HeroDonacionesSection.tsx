export const HeroDonationSection = () => (
  <section className="bg-[#111111] text-white text-center font-[Poppins]">
    <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
        <span className="block">Salva</span>
        <span className="block text-red-800">Vidas</span>
        <span className="block text-gray-300">Con Tu Ayuda</span>
      </h1>

      <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Cada donación fortalece nuestra capacidad de respuesta ante emergencias y protege a nuestra comunidad. 
        Únete a nuestra misión de servicio y protección.
      </p>

      <div className="mt-12">
        <a
          href="#tipos-de-donacion"
          className="px-6 py-3 bg-red-800 backdrop-blur-sm border border-white/30 text-white font-medium rounded-3xl hover:bg-red-700 transition shadow-md hover:shadow-lg inline-block transform hover:-translate-y-1"
        >
          Ver Tipos de Donación
        </a>
      </div>
    </div>
  </section>
);
