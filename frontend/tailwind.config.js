/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1f8e9',
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#aed581',
          400: '#9ccc65',
          500: '#8bc34a',
          600: '#7cb342',
          700: '#689f38',
          800: '#558b2f',
          900: '#33691e',
        },
        secondary: {
          50: '#e8f1f8',
          100: '#c8dce9',
          200: '#a5c6d9',
          300: '#81b0c9',
          400: '#5d9ab9',
          500: '#3b6ea5',
          600: '#2e5c8a',
          700: '#234a6f',
          800: '#183854',
          900: '#0d2639',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
