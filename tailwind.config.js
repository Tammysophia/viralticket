/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#8B5CF6',
          lilac: '#A855F7',
        },
        dark: {
          900: '#0B0B0F',
          800: '#18181B',
        },
        gold: {
          500: '#FBBF24',
          600: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
