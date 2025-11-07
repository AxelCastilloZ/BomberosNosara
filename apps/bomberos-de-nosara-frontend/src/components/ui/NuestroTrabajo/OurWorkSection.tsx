// ------------------------------
// OurWorkSection.tsx
// ------------------------------
import TitleBlock from "./TitleBlock";
import DescriptionList from "./DescriptionList";
import ImageBlock from "./ImageBlock";
import DonateButton from "./DonateButton";
import StatsRow from "./StatsRow";

export default function OurWorkSection() {
  return (
    <section className="w-full bg-white font-[Poppins] text-[#1F2937]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid gap-8 md:gap-12 items-start md:[grid-template-columns:1.3fr_0.7fr]">
          {/* Columna izquierda */}
          <div className="order-2 md:order-1 space-y-6">
            <TitleBlock />
            <DescriptionList />
            <div className="pt-4">
              <DonateButton />
            </div>
          </div>

          {/* Imagen derecha */}
          <div className="order-1 md:order-2 md:justify-self-end md:max-w-[420px] lg:max-w-[460px] xl:max-w-[520px] w-full">
            <ImageBlock variant="portrait" focal="leftCenter" />
          </div>
        </div>

        {/* Métricas */}
        <div className="mt-10 sm:mt-12 border-t border-gray-100 pt-8">
          <StatsRow />
        </div>
      </div>
    </section>
  );
}
