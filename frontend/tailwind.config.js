/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aqua: {
          50:  "#e0f7ff",
          100: "#b3ecff",
          200: "#80dffe",
          300: "#4dd2fd",
          400: "#26c8fc",
          500: "#00bdfb",
          600: "#00aee6",
          700: "#0099cc",
          800: "#0085b3",
          900: "#005f80",
        },
      },
    },
  },
  plugins: [],
};
