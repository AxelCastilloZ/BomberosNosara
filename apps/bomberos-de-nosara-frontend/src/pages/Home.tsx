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
      <div className="min-h-screen bg-white">
        {/* Hero principal */}
        <section className="w-full py-0">
          <div className="min-h-[calc(100svh-6rem)] lg:min-h-[calc(100svh-4rem)]">
            <WelcomeSection />
          </div>
        </section>

        {/* Secciones */}
        <section id="about-us" className="w-full px-8 scroll-mt-24">
          <AboutUsPage />
        </section>

        <section className="w-full mt-16 px-0 overflow-x-hidden">
          <NuestroTrabajoPage />
        </section>

        <section className="w-full px-8 mt-10">
          <DonantesPage />
        </section>

        <section className="w-full px-8 mt-16">
          <NoticiasPage />
        </section>

        {/* Donar completamente pegado */}
        <section
          id="donar"
          className="w-full scroll-mt-24 mb-[-2px] pb-0"
        >
          <DonarPage />
        </section>

        {/* Footer sin espacio */}
        <section className="w-full mt-0 pt-0">
          <FooterPage />
        </section>
      </div>
    </>
  );
}
