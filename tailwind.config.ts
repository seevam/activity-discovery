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
        // Modern brand colors - 2025/2026 palette
        'blue-primary': '#3B82F6',        // Modern blue (Tailwind blue-500)
        'blue-deep': '#2563EB',           // Deeper blue variant (blue-600)
        'purple-primary': '#8B5CF6',      // Modern purple accent (purple-500)
        'purple-creative': '#A855F7',     // Rich creative purple (purple-600)
        'pink-accent': '#EC4899',         // Warm pink accent (pink-500)
        'cyan-light': '#06B6D4',          // Clean cyan (cyan-500)
        'cyan-ultra-light': '#E0F2FE',    // Soft blue background (blue-100)
        'green-success': '#10B981',       // Modern emerald green (emerald-500)
        'amber-warm': '#F59E0B',          // Warm amber (amber-500)
        'badge-gold': '#F59E0B',          // Amber gold for badges
        'badge-silver': '#9CA3AF',        // Modern gray (gray-400)
        'badge-locked': '#E5E7EB',        // Light gray (gray-200)
        // Legacy aliases for gradual migration
        'yellow-primary': '#8B5CF6',      // Maps to purple-primary
        'orange-warm': '#F59E0B',         // Maps to amber-warm
      },
      fontFamily: {
        sans: ['Nunito', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'button': '0 4px 0 rgba(59, 130, 246, 0.25)',
        'button-hover': '0 6px 0 rgba(59, 130, 246, 0.3)',
        'button-active': '0 2px 0 rgba(59, 130, 246, 0.25)',
        'button-purple': '0 4px 0 rgba(139, 92, 246, 0.25)',
        'button-purple-hover': '0 6px 0 rgba(139, 92, 246, 0.3)',
        'button-purple-active': '0 2px 0 rgba(139, 92, 246, 0.25)',
        'card-modern': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 12px rgba(0, 0, 0, 0.06)',
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
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.8)',
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
