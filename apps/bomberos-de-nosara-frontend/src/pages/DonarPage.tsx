import { DonarAhoraSection } from '../components/ui/Donante/DonarAhoraSection';

export default function DonarPage() {
  return (
    <main className="pt-24">
      <section className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif font-light text-center mb-12">
            Tipos de Donaciones
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md text-center">
              <div className="bg-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif mb-4">Donación de Equipo Bomberil</h2>
              <p className="text-gray-600">
                Contribuye con equipos de protección personal, herramientas especializadas, 
                extintores y otros equipos esenciales para las operaciones de emergencia.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-md text-center">
              <div className="bg-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif mb-4">Donación de Vehículos</h2>
              <p className="text-gray-600">
                Apoya con vehículos de emergencia, camiones bomberos, 
                ambulancias o cualquier vehículo que pueda ser adaptado para servicios de emergencia.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <a
              href="https://www.classy.org/give/216044/#!/donation/checkout"
              target="_blank"
              rel="noopener noreferrer"
              className="transition transform hover:-translate-y-1 duration-300 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-3xl inline-block text-lg"
            >
              DONAR AHORA
            </a>
          </div>
        </div>
      </section>
      
      <DonarAhoraSection />
    </main>
  );
}