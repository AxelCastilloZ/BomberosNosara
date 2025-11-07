import FooterSection from "../components/ui/Footer/footer";

export default function FooterPage() {
  return (
    <main className="bg-white m-0 p-0">
      {/* 🔹 Deja solo un espacio visual mínimo entre el bloque negro y el footer */}
      <div className="mt-[-2px]">
        <FooterSection />
      </div>
    </main>
  );
}
