import { aboutParagraphs } from "../../../data/aboutData";

export default function ParagraphList() {
  return (
    <div className="space-y-5 text-gray-700 text-base leading-relaxed">
      {aboutParagraphs.map((p) => (
        <p key={p.id}>{p.content}</p>
      ))}
    </div>
  );
}
