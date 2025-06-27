import TitleBlock from "./Titleblock";
import HeroTextBlock from "./HeroTextBlock";
import ParagraphList from "./ParagrahpList";
import ImageBlock from "./ImageBlock";

export default function AboutSection() {
  return (
    <section className="w-full bg-white px-6 py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2">
          <TitleBlock />
          <HeroTextBlock />
          <ParagraphList />
        </div>

        <div className="w-full md:w-1/2">
          <ImageBlock />
        </div>
      </div>
    </section>
  );
}
