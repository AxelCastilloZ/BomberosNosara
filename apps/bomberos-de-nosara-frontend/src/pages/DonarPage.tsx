import { DonacionesSection } from "../components/ui/Donar/DonacionesSection";

export default function DonarPage() {
  return (
    <main className="font-[Poppins] bg-[#111827] text-white m-0 p-0 overflow-hidden">
      {/* Una sola sección consolidada que reemplaza las 3 anteriores */}
      <DonacionesSection />
    </main>
  );
}