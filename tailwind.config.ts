import type { Config } from 'tailwindcss'
import rtl from 'tailwindcss-rtl'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F4EF',
        surface: '#FFFFFF',
        primary: '#8B4513',
        secondary: '#C97D4E',
        'text-main': '#2C1810',
        muted: '#888888',
        border: '#E5DDD5',
        gold: '#C9A96E',
        // Extended premium palette
        'deep-burgundy': '#5C1A1A',
        champagne: '#F7E7C6',
        obsidian: '#1A0A0A',
        fog: '#F0EBE3',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'noto-sc': ['var(--font-noto-sc)', 'sans-serif'],
        'noto-jp': ['var(--font-noto-jp)', 'sans-serif'],
        'noto-arabic': ['var(--font-noto-arabic)', 'sans-serif'],
      },
      lineHeight: {
        'cjk-zh': '1.7',
        'cjk-ja': '1.8',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '600ms',
        'very-slow': '1200ms',
      },
      transitionTimingFunction: {
        wine: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'wine-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      boxShadow: {
        wine: '0 4px 24px rgba(139, 69, 19, 0.12)',
        gold: '0 4px 24px rgba(201, 169, 110, 0.2)',
        deep: '0 20px 60px rgba(44, 24, 16, 0.15)',
        glass: '0 8px 32px rgba(44, 24, 16, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'gradient-wine': 'linear-gradient(135deg, #5C1A1A, #8B4513, #C97D4E)',
        'gradient-gold': 'linear-gradient(135deg, #C9A96E, #F7E7C6, #C9A96E)',
        'gradient-hero': 'linear-gradient(160deg, #F8F4EF 0%, #F0EBE3 50%, #E8DDD0 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,244,239,0.6))',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 169, 110, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 169, 110, 0.6)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        glow: 'glow 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [rtl],
}

export default config
