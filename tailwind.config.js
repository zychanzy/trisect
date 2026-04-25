/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        parchment: '#F7F5F2',
        ink: '#1C1B19',
        stone: {
          50:  '#FAFAF8',
          100: '#F7F5F2',
          200: '#F0EDE8',
          300: '#E5E2DC',
          400: '#D8D5CF',
          500: '#C0BCB6',
          600: '#AEAAA4',
          700: '#A09D98',
          800: '#8A8880',
          900: '#666360',
        },
        brand: {
          teal:      '#3D9E7F',
          indigo:    '#7060D0',
          terracotta:'#C85836',
        },
      },
      borderRadius: {
        tile: '14px',
      },
      letterSpacing: {
        widest2: '0.30em',
        wide2:   '0.18em',
        wide3:   '0.10em',
        wide4:   '0.09em',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.8)',   opacity: '0' },
          '65%':  { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)',     opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-5px)' },
          '40%':      { transform: 'translateX(5px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.45s ease forwards',
        'pop':        'pop 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shake':      'shake 0.45s ease',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
