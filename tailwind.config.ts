import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        blush:     { DEFAULT: '#f2a7b8', light: '#fce4ec', dark: '#c2185b' },
        champagne: { DEFAULT: '#f7e7ce', dark: '#c8a97e' },
        noir:      { DEFAULT: '#1a1015', mid: '#2d1f28', light: '#3d2f38' },
        gold:      { DEFAULT: '#c9a84c', light: '#e8d48a' },
      },
      fontFamily: {
        display: ["'Playfair Display'", 'Georgia', 'serif'],
        body:    ["'Lato'", 'sans-serif'],
        mono:    ["'DM Mono'", 'monospace'],
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease forwards',
        'fade-in':  'fadeIn 0.2s ease forwards',
        'shimmer':  'shimmer 3s linear infinite',
        'float':    'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config