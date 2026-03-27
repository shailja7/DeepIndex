/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: "#1E1B4B",
        neon: "#A78BFA",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
