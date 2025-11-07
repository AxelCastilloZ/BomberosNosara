import React from "react";
import welcomeImage from "../../../images/welcome.png";

export default function WelcomeSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${welcomeImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Contenido centrado */}
      <div className="relative z-10 px-6 text-center text-white max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-serif font-light mb-4">
          Bienvenido a Bomberos Nosara
        </h1>
        <p className="text-lg md:text-xl leading-relaxed mb-8">
          Nos dedicamos a servir a la comunidad de Nosara con compromiso,
          integridad y acción. Conocé más sobre nuestros aliados y cómo podés
          apoyar nuestra labor.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => scrollTo("about-us")}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-medium rounded-2xl hover:bg-white/20 transition"
          >
            Conócenos!
          </button>
          <button
            onClick={() => scrollTo("donar")}
            className="px-4 py-3 bg-red-800 backdrop-blur-sm border border-white/30 text-white font-medium rounded-3xl hover:bg-red-700 transition"
          >
            ¿Cómo apoyar?
          </button>
        </div>
      </div>
    </section>
  );
}