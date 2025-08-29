import trainingImg from "../../../images/WhatsApp Image 2025-08-28 at 8.51.47 PM.jpeg";

type Variant = "landscape" | "portrait" | "square";
type Focal =
  | "center"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "leftCenter"
  | "rightCenter";

const ratioClass: Record<Variant, string> = {
  landscape: "aspect-[16/10] md:aspect-[5/4]",
  // ↓ menos alta en desktop (antes era 4/5 o 3/4)
  portrait: "aspect-[3/4] md:aspect-[2/3]",
  square: "aspect-square",
};

const focalClass: Record<Focal, string> = {
  center: "object-center",
  left: "object-left",
  right: "object-right",
  top: "object-top",
  bottom: "object-bottom",
  leftCenter: "object-[30%_center]",
  rightCenter: "object-[70%_center]",
};

export default function ImageBlock({
  variant = "portrait",
  focal = "leftCenter",
}: {
  variant?: Variant;
  focal?: Focal;
}) {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-white">
      <div className={ratioClass[variant]}>
        <img
          src={trainingImg}
          alt="Entrenamiento Bomberos Nosara"
          loading="lazy"
          className={`h-full w-full object-cover ${focalClass[focal]}`}
        />
      </div>
    </div>
  );
}