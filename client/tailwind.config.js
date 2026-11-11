/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#050914',
          floor: '#0a1024',
          card: '#101c3d',
          cardBorder: '#233876',
          gold: '#e5b842',
          goldBright: '#ffd700',
          goldDark: '#8a6d1e',
          safeGreen: '#10b981',
          dangerRed: '#dc2626',
          cyanGlow: '#0284c7',
        }
      },
      fontFamily: {
        game: ['"Montserrat"', 'sans-serif'],
        display: ['"Cinzel"', 'serif'],
        mono: ['"Courier Prime"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(229, 184, 66, 0.45)',
        'blue-glow': '0 0 25px rgba(2, 132, 199, 0.45)',
        'red-glow': '0 0 25px rgba(220, 38, 38, 0.55)',
        'studio-inset': 'inset 0 0 40px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
