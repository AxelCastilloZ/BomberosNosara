import { HeroDonationSection } from "../components/ui/Donar/HeroDonacionesSection";
import { TiposDonacionesSection } from "../components/ui/Donar/TiposDonacionesSection";
import { DonarAhoraSection } from "../components/ui/Donar/DonarAhoraSection";

export default function DonarPage() {
  return (
    <main className="font-[Poppins] bg-white text-[#1F2937]">
      <HeroDonationSection />
      <TiposDonacionesSection />
      <DonarAhoraSection />
    </main>
  );
}
