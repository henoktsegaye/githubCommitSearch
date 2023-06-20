//import tailwind colors
const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.green[700],
          50: colors.green[50],
          100: colors.green[100],
          200: colors.green[200],
          300: colors.green[300],
          400: colors.green[400],
          500: colors.green[500],
          600: colors.green[600],
          700: colors.green[700],
          800: colors.green[800],
          900: colors.green[900],

        },
        secondary: {
          DEFAULT: colors.red[500],
          50: colors.red[50],
          100: colors.red[100],
          200: colors.red[200],
          300: colors.red[300],
          400: colors.red[400],
          500: colors.red[500],
          600: colors.red[600],
          700: colors.red[700],
          800: colors.red[800],
          900: colors.red[900],

        }
      },
      height: {
        '500px': '500px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
   ],
}