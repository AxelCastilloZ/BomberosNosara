import { HeroDonationSection } from "../components/ui/Donar/HeroDonacionesSection";
import { TiposDonacionesSection } from "../components/ui/Donar/TiposDonacionesSection";
import { DonarAhoraSection } from "../components/ui/Donar/DonarAhoraSection";

export default function DonarPage() {
  return (
    // Eliminamos márgenes y rellenos que provocaban el espacio blanco
    <main className="font-[Poppins] bg-white text-[#1F2937] m-0 p-0 overflow-hidden">
      {/* Sección de encabezado de donaciones */}
      <HeroDonationSection />

      {/* Sección con tipos de donación */}
      <TiposDonacionesSection />

      {/* Sección final con el botón DONAR AHORA (fondo negro pegado al footer) */}
      <div className="m-0 p-0">
        <DonarAhoraSection />
      </div>
    </main>
  );
}
