/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,svelte,ts,js}"],
  theme: {
    extend: {
      colors: {
        "space-cadet": "#2A2D43",
        "delft-blue": "#414361",
        "powder-blue": "#A9B3CE",
        greige: "#E9EDDE",
        maize: "#E7E247",
      },
    },
  },
  plugins: [],
};
