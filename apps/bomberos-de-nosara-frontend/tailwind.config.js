/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Inter como fuente principal por defecto
        inter: ['Inter', 'sans-serif'], // También disponible como font-inter
      },
      colors: {
        // Colores personalizados del proyecto Bomberos de Nosara
        brand: {
          red: {
            light: '#EF4444',
            DEFAULT: '#B91C1C',
            dark: '#991B1B',
          },
        },
      },
      keyframes: {
        slideFadeIn: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        slideFadeIn: "slideFadeIn 0.25s ease-out forwards",
      },
    },
  },
  plugins: [],
};