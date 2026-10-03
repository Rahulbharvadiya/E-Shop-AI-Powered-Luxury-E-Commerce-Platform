/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0D0606',
        light: '#F8F6F6',
        accent: {
          DEFAULT: '#FF9E00',
          hover: '#FFAE26',
          dark: '#D98500',
        },
        surface: {
          DEFAULT: '#140B0B',
          elevated: '#1B1010',
          card: '#160D0D',
          hover: '#201313',
        }
      },
      fontFamily: {
        giliran: ['Giliran', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
