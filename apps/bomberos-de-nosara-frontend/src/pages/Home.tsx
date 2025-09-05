import AboutUsPage from "./AboutUsPage";
import DonantesPage from "./DonantesPage";
import NoticiasPage from "./NoticiasPage";
import NuestroTrabajoPage from "./NuestroTrabajoPage";
import DonarPage from "./DonarPage";
import FooterPage from "./FooterPage";
import WelcomeSection from "../components/ui/AboutUs/WelcomeSection";

export default function Home() {
  return (
    <div>
      <div className="w-full bg-white">
        {/* Hero / Encabezado */}
        <section className="w-full max-w-none">
          <WelcomeSection />
        </section>

        {/* Secciones (todas full width) */}
        <section id="about-us" className="w-full max-w-none">
          <AboutUsPage />
        </section>

        <section className="w-full max-w-none">
          <NuestroTrabajoPage />
        </section>

        <section className="w-full max-w-none">
          <DonantesPage />
        </section>

        <section className="w-full max-w-none">
          <NoticiasPage />
        </section>

        <section id="donar" className="w-full max-w-none">
          <DonarPage />
        </section>

        {/* Usamos ContactoPage para no dejar import sin uso */}


        {/* Footer full width */}
        <section className="w-full max-w-none">
          <FooterPage />
        </section>
      </div>
    </div>
  );
}
