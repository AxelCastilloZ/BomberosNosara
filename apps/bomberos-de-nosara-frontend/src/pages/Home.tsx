import AboutUsPage from "./AboutUsPage";
import DonantesPage from "./DonantesPage";
import NoticiasPage from "./NoticiasPage";
import NuestroTrabajoPage from "./NuestroTrabajoPage";
import DonarPage from "./DonarPage";
import FooterPage from "./FooterPage";
import WelcomeSection from "../components/ui/AboutUs/WelcomeSection";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-white pt-24">
        {/* Hero / Encabezado */}
        <section className="w-full py-0">
          <WelcomeSection />
        </section>

        {/* Secciones (todas full width) */}
        <section id="about-us" className="w-full px-8">
          <AboutUsPage />
        </section>

        <section className="w-full px-8 mt-16">
          <NuestroTrabajoPage />
        </section>

        <section className="w-full px-8 mt-10">
          <DonantesPage />
        </section>

        <section className="w-full px-8 mt-16">
          <NoticiasPage />
        </section>

        <section id="donar" className="w-full mt-16">
          <DonarPage />
        </section>

        {/* Usamos ContactoPage para no dejar import sin uso */}
       

        {/* Footer full width también */}
        <section className="w-full mt-16">
          <FooterPage />
        </section>
      </div>
    </>
  );
}
