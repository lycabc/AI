/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-blue": "#3b82f6",
        "brand-dark": "#020617",
        "brand-darker": "#0B192C",
      },
    },
  },
  plugins: [],
};
