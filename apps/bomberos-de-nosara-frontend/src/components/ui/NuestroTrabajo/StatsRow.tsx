export default function StatsRow() {
  const stats = [
    { value: "24/7", label: "Servicio de emergencia" },
    { value: "15+", label: "Años de experiencia" },
    { value: "1000+", label: "Vidas salvadas" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
      {stats.map((s) => (
        <div key={s.label} className="space-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-red-600">
            {s.value}
          </div>
          <div className="text-gray-600">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
