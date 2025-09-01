import { DonarAhoraSection } from '../components/ui/Donar/DonarAhoraSection';
import { HeroDonationSection } from '../components/ui/Donar/HeroDonacionesSection';
import { EmergencyCTASection } from '../components/ui/Donar/MergencySection';
import { TiposDonacionesSection } from '../components/ui/Donar/TiposDonacionesSection';

export default function DonarPage() {
  return (
    <main>
      <HeroDonationSection />
      <div id="tipos-de-donacion">
        <TiposDonacionesSection />
      </div>
       <DonarAhoraSection />
      
    </main>
  );
}