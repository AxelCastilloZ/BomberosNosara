import { ourWorkItems, ourWorkTitle } from "../../../data/ourWorkData";

export default function Description() {
  return (
    <div>
      <h2 className="text-2xl md:text-4xl font-light text-gray-900 mb-6 leading-snug">
        {ourWorkTitle}
      </h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700 text-base leading-relaxed">
        {ourWorkItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
