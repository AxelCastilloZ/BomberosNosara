import { ListaNoticias } from "../components/ui/Noticias/ListaNoticias";

const NoticiasPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 font-[Poppins]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-12"
          style={{ color: "#111111" }} // Negro elegante institucional
        >
          Últimas Noticias
        </h1>

        <ListaNoticias />
      </div>
    </main>
  );
};

export default NoticiasPage;
