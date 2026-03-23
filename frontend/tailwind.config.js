/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aqua: {
          50:  "#e0f7ff",
          100: "#b3ecff",
          200: "#80e0ff",
          300: "#4dd4ff",
          400: "#26caff",
          500: "#00bfff",
          600: "#00a8e0",
          700: "#0090be",
          800: "#00789c",
          900: "#005f7a",
        },
      },
    },
  },
  plugins: [],
};
