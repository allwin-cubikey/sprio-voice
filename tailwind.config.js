/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#111111',
        sidebar: '#111111',
        border: '#222222',
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          muted: 'rgba(99,102,241,0.15)',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        'text-primary': '#f5f5f5',
        'text-muted': '#71717a',
        'text-secondary': '#a1a1aa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        input: '6px',
        badge: '4px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.05)',
        glow: '0 0 20px rgba(99,102,241,0.2)',
      },
      animation: {
        'wave': 'wave 1.2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateY(-8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
