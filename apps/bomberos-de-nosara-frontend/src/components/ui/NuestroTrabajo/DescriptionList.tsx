import { ourWorkItems } from "../../../data/ourWorkData";
import type { ReactNode } from "react";

function Icon({ index }: { index: number }) {
  // Íconos SVG simples en rojo, elegidos por índice
  const common = "w-5 h-5 flex-none";
  const icons: ReactNode[] = [
    // fuego
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M13.4 1.7a1 1 0 0 1 1.6.8c.1 2.2-.6 3.8-1.6 5.2 2-.1 3.9-1 5.2-2.7a1 1 0 0 1 1.8.7c-.3 4.7-2.4 7.8-6.1 9.2a5 5 0 1 1-8.8 3.4c0-3.1 1.6-5.6 3.6-7.6 1.3-1.4 2.7-2.5 3.5-4.2.6-1.3.8-2.8.8-4.8Z"/></svg>,
    // corazón/salud
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 21s-7.2-4.6-9.3-8.1C1.3 10.5 2.1 7 5.4 6c2.3-.7 4 1 4.6 2 .6-1 2.3-2.7 4.6-2 3.3 1 4.1 4.5 2.7 6.9C19.2 16.4 12 21 12 21Z"/></svg>,
    // escudo
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 7.9 8 11 4.6-3.1 8-6 8-11V5l-8-3Z"/></svg>,
    // olas
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M3 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v2c-2.5 0-2.5-2-5-2s-2.5 2-5 2-2.5-2-5-2-2.5 2-5 2V9Z"/></svg>,
    // montaña
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 3 2 20h20L12 3Zm0 5 6 10H6l6-10Z"/></svg>,
    // carro
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M5 11 7 6h10l2 5h1a1 1 0 0 1 1 1v5h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3v-5a1 1 0 0 1 1-1h1Zm3-3-1 3h10l-1-3H8Z"/></svg>,
    // pata
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 12c-3 0-6 2-6 5 0 1.7 1.3 3 3 3 1.4 0 2.6-.9 3-2 .4 1.1 1.6 2 3 2 1.7 0 3-1.3 3-3 0-3-3-5-6-5Zm-5-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>,
    // birrete
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="m12 3 10 5-10 5L2 8l10-5Zm0 7 7 3.5V17l-7 4-7-4v-3.5L12 10Z"/></svg>,
    // usuarios
    <svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0v1H5Z"/></svg>,
  ];
  const i = index % icons.length;
  return <span className="text-red-600">{icons[i]}</span>;
}

export default function DescriptionList() {
  return (
    <ul className="space-y-4">
      {ourWorkItems.map((text, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <Icon index={idx} />
          <span className="text-gray-800 leading-relaxed">
            {text}
          </span>
        </li>
      ))}
    </ul>
  );
}
