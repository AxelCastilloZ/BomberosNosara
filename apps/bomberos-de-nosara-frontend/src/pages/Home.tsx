import AboutUsPage from "./AboutUsPage";
import DonantesPage from "./DonantesPage";
import NoticiasPage from "./NoticiasPage";
import SuggestionsPage from "./SuggestionsPage";
import NuestroTrabajoPage from "./NuestroTrabajoPage";
import ContactoPage from "./ContactoPage";
import DonarPage from "./DonarPage";
import FooterPage from "./FooterPage";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-white pt-28">
        {/* Hero / Encabezado */}
        <section className="w-full px-8 text-center">
          <h1 className="text-5xl font-serif font-light text-gray-900 mb-6">
            Bienvenido a Bomberos Nosara
          </h1>

          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Nos dedicamos a servir a la comunidad de Nosara con compromiso,
            integridad y acción. Conocé más sobre nuestros aliados y cómo podés
            apoyar nuestra labor.
          </p>
        </section>

        {/* Secciones (todas full width) */}
        <section className="w-full px-8">
          <AboutUsPage />
        </section>

        <section className="w-full px-8 mt-16">
          <NuestroTrabajoPage />
        </section>

        <section className="w-full px-8 mt-16">
          <DonantesPage />
        </section>

        <section className="w-full px-8 mt-16">
          <NoticiasPage />
        </section>

      

        <section className="w-full px-8 mt-16">
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
