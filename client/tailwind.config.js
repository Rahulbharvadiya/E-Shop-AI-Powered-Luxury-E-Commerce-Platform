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
          DEFAULT: '#1E3A34',
          dark: '#142922',
          light: '#2A524A',
        },
        forest: {
          DEFAULT: '#1E3A34',
          dark: '#142922',
          light: '#2A524A',
        },
        accent: {
          DEFAULT: '#C2603F',
          dark: '#A44E31',
          light: '#D47555',
          hover: '#A44E31',
        },
        terracotta: {
          DEFAULT: '#C2603F',
          dark: '#A44E31',
          light: '#D47555',
        },
        gold: {
          DEFAULT: '#B8935A',
          light: '#D4B37F',
          dark: '#9A7742',
        },
        cream: {
          DEFAULT: '#FAF6EF',
          surface: '#FFFFFF',
          muted: '#F5EFEB',
          border: '#E7DFD2',
        },
        charcoal: {
          DEFAULT: '#1F2421',
          muted: '#6B665E',
          light: '#9E988F',
        },
        sage: '#4F7A5A',
        brick: '#A63D2F',
        // Backward-compatible mappings
        dark: '#1E3A34',
        light: '#FAF6EF',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FAF6EF',
          card: '#FFFFFF',
          hover: '#F5EFEB',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        giliran: ['Playfair Display', 'Georgia', 'serif'],
        poppins: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        head: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        subtle: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        classic: '0 2px 12px rgba(30, 58, 52, 0.08)',
        subtle: '0 1px 4px rgba(30, 58, 52, 0.05)',
        gold: '0 4px 14px rgba(184, 147, 90, 0.2)',
        terracotta: '0 4px 14px rgba(194, 96, 63, 0.25)',
      }
    },
  },
  plugins: [],
}
