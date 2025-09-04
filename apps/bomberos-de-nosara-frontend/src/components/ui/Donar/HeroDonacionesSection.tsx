export const HeroDonationSection = () => (
  <section className="bg-black text-white">
    <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28 lg:py-32 text-center">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight">
        <span className="block ">Salva</span>
        <span className="block text-red-500">Vidas</span>
        <span className="block text-gray-300">Con Tu Ayuda</span>
      </h1>
      
      <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Cada donación fortalece nuestra capacidad de respuesta ante emergencias y protege a nuestra comunidad. Únete a nuestra misión de servicio y protección.
      </p>
      
      <div className="mt-12">
        <a
          href="#tipos-de-donacion"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 inline-block"
        >
          Ver Tipos de Donación
        </a>
      </div>
    </div>
  </section>
);