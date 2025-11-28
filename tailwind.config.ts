import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from specification
        'yellow-primary': '#FFF100',
        'blue-primary': '#006BFF',
        'cyan-light': '#08C2FF',
        'cyan-ultra-light': '#BCF2F6',
        'green-success': '#58CC02',
        'purple-creative': '#CE82FF',
        'orange-warm': '#FF9600',
        'badge-gold': '#FFD700',
        'badge-silver': '#C0C0C0',
        'badge-locked': '#E0E0E0',
      },
      fontFamily: {
        sans: ['Nunito', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'button': '0 4px 0 rgba(0, 107, 255, 0.3)',
        'button-hover': '0 6px 0 rgba(0, 107, 255, 0.3)',
        'button-active': '0 2px 0 rgba(0, 107, 255, 0.3)',
      },
      animation: {
        'badge-unlock': 'badgeUnlock 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'rainbow-pulse': 'rainbowPulse 2s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        badgeUnlock: {
          '0%': {
            transform: 'scale(0) rotate(-180deg)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.2) rotate(10deg)',
          },
          '100%': {
            transform: 'scale(1) rotate(0)',
            opacity: '1',
          },
        },
        rainbowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
          },
        },
        shimmer: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
