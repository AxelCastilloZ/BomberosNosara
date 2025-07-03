import AboutUsPage from "./AboutUsPage";
import DonantesPage from "./DonantesPage";
import NoticiasPage from "./NoticiasPage";
import SuggestionsPage from "./SuggestionsPage";
import NuestroTrabajoPage from "./NuestroTrabajoPage";
import ContactoPage from "./ContactoPage";

export default function Home() {
    return (
        <div className="min-h-screen bg-white px-4 text-center pt-28 flex flex-col items-center">
            <h1 className="text-5xl font-serif font-light text-gray-900 mb-6">
                Bienvenido a Bomberos Nosara
            </h1>

            <p className="text-lg text-gray-700 max-w-xl mb-8 leading-relaxed">
                Nos dedicamos a servir a la comunidad de Nosara con compromiso, integridad y acción.
                Conocé más sobre nuestros aliados y cómo podés apoyar nuestra labor.
            </p>

            <AboutUsPage />

            <div>
                <NuestroTrabajoPage/>
            </div>
            

            <div className="mt-16 w-full">
                <DonantesPage />
            </div>
            <div className="mt-16 w-full">
                <NoticiasPage />
            </div>
            <SuggestionsPage />
            <ContactoPage/>
        </div>
        
    );
}
