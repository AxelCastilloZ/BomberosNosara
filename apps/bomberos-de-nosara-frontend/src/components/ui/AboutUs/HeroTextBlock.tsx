import { heroText } from "../../../data/aboutData";

export default function HeroTextBlock() {
  return (
    <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-6 leading-snug">
      {heroText}
    </h2>
  );
}
