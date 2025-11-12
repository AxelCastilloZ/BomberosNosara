// ------------------------------
// StatsRow.tsx
// ------------------------------
export default function StatsRow() {
  const stats = [
    { value: "24/7", label: "Servicio de emergencia" },
    { value: "15+", label: "Años de experiencia" },
    { value: "1000+", label: "Vidas salvadas" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center font-[Poppins]">
      {stats.map((s) => (
        <div key={s.label} className="space-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-[#B22222]">
            {s.value}
          </div>
          <div className="text-[#6B7280] text-sm sm:text-base">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
