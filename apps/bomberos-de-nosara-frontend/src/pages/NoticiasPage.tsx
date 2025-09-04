import { ListaNoticias } from "../components/ui/Noticias/ListaNoticias";


const NoticiasPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-center text-gray-800 mb-8 sm:mb-10 lg:mb-12">
          Últimas Noticias
        </h1>
        <ListaNoticias />
      </div>
    </main>
  );
};

export default NoticiasPage
