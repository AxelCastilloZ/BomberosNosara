// ------------------------------
// DonateButton.tsx
// ------------------------------
export default function DonateButton() {
  return (
    <a
      href="/donar"
      className="inline-flex items-center justify-center px-6 py-3 rounded-xl
                 bg-[#B22222] text-white font-[Poppins] font-semibold shadow
                 hover:bg-[#8B1B1B] active:bg-[#701414]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222]
                 transition-all duration-300"
    >
      DONA AHORA
    </a>
  );
}
