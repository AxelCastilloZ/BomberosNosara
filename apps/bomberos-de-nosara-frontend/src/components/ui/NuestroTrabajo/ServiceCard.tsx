import { LucideIcon } from "lucide-react";
import { Card } from "../card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <Card className="group relative min-h-[180px] bg-white/60 backdrop-blur-sm border-2 border-gray-200/80 p-6 shadow-lg transition-all duration-300 hover:border-red-600 hover:bg-white hover:shadow-xl flex flex-col items-center justify-center text-center space-y-3">
      {/* Icono con fondo rojo */}
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-8 w-8" strokeWidth={2.5} />
      </div>

      {/* Título */}
      <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-wide">
        {title}
      </h3>

      {/* Descripción */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}