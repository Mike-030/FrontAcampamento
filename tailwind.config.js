/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Restaurando nomes para compatibilidade com Login/Register
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-ui': 'var(--border-ui)',
        'brand': 'var(--brand)',
        'forest': 'var(--forest)',
        // Nomes curtos para o App.svelte novo
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'main': 'var(--text-primary)',
        'sub': 'var(--text-secondary)',
        'border': 'var(--border-ui)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}
