// src/pages/Home.tsx
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
      {/* Con navbar sticky, NO usamos pt-24 global */}
      <div className="min-h-screen bg-white">
        {/* Hero / Encabezado */}
        <section className="w-full py-0">
          {/* 👇 Compensa la altura del navbar sticky:
               - 6rem (h-24) al entrar
               - 4rem (h-16) cuando ya está reducido en pantallas grandes
               100svh mejora el cálculo en iOS/Android */}
          <div className="min-h-[calc(100svh-6rem)] lg:min-h-[calc(100svh-4rem)]">
            <WelcomeSection />
          </div>
        </section>

        {/* Secciones (todas full width) */}
        {/* Si llegas por ancla #about-us, scroll deja margen con scroll-mt-24 */}
        <section id="about-us" className="w-full px-8 scroll-mt-24">
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

        {/* Si apuntas con #donar, usa scroll-mt-24 también */}
        <section id="donar" className="w-full mt-16 scroll-mt-24">
          <DonarPage />
        </section>

        {/* Footer full width */}
        <section className="w-full mt-16">
          <FooterPage />
        </section>
      </div>
    </>
  );
}
