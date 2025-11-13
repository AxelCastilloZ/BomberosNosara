import { Donante } from "../../../types/donate";
import { DonanteCard } from "./DonanteCard";

interface GridProps {
  donantes: Donante[];
  onLeerMas: (donante: Donante) => void;
}

export const DonantesGrid = ({ donantes, onLeerMas }: GridProps) => (
  <section className="py-16 sm:py-20 bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Encabezado de la sección */}
      <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
          Quiénes nos apoyan
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
          Si desea formar parte de este selecto grupo, envíe un correo a:{" "}
          <a 
            href="mailto:donaciones@bomberosdenosara.org"
            className="font-semibold text-red-700 hover:text-red-800 underline underline-offset-4 transition-colors"
          >
            donaciones@bomberosdenosara.org
          </a>
        </p>
      </div>

      {/* Grid de donantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
        {donantes.map((donante) => (
          <DonanteCard key={donante.id} donante={donante} onClick={() => onLeerMas(donante)} />
        ))}
      </div>
    </div>
  </section>
);