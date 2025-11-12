import { ourWorkTitle } from "../../../data/ourWorkData";

export default function TitleBlock() {
  return (
    <header className="font-[Poppins]">
      <h1
        className="text-4xl sm:text-5xl font-extrabold tracking-tight"
        style={{ color: "#111111" }} // negro institucional
      >
        {ourWorkTitle}
      </h1>
    </header>
  );
}
