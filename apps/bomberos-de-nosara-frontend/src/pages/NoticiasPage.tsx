import { ListaNoticias } from '../components/ui/Noticias/ListaNoticias'

const NoticiasPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white  py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Últimas Noticias
        </h1>
        <ListaNoticias />
      </div>
    </main>
  );
};

export default NoticiasPage
