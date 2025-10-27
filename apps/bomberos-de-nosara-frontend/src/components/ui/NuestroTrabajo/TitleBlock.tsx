import { ourWorkTitle } from "../../../data/ourWorkData";

export default function TitleBlock() {
  return (
    <header>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
        {ourWorkTitle}
      </h1>
    </header>
  );
}
