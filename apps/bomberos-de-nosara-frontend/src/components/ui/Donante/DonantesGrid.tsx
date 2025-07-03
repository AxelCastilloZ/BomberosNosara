import { Donante } from "../../../types/donate";
import { DonanteCard } from "./DonanteCard";

interface GridProps {
  donantes: Donante[];
  onLeerMas: (donante: Donante) => void;
}

export const DonantesGrid = ({ donantes, onLeerMas }: GridProps) => (
  <section className="py-12 bg-white">
    <div className="text-center mb-10">
      <h2 className=" text-4xl lg:text-5xl font-serif font-light md:text-5xl pt-4 ">Quienes nos apoyan</h2>
      <p className="text-gray-700 mt-4 sm:text-3xl">
        Si desea formar parte de este selecto grupo, envíe un correo a:{" "}
        <span className="font-normal not-italic underline underline-offset-4">donaciones@bomberosdenosara.org</span>
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 place-items-center">
      {donantes.map((donante) => (
        <DonanteCard key={donante.id} donante={donante} onClick={() => onLeerMas(donante)} />
      ))}
    </div>
  </section>
);
