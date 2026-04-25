/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': '#646cff',
        'dark-bg': '#0f172a',
        'card-bg': '#1e293b',
      }
    },
  },
  plugins: [],
}
