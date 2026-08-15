/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vsi: {
          bg: '#050505',
          card: 'rgba(15, 15, 18, 0.75)',
          border: 'rgba(255, 43, 43, 0.25)',
          red: '#ff2b2b',
          'red-bright': '#ff3b3b',
          'red-dark': '#c91818',
          'red-glow': 'rgba(255, 43, 43, 0.4)',
          gray: '#9ca3af',
          'gray-light': '#e5e7eb',
          'gray-dark': '#1c1c24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'vsi-glow': '0 0 35px rgba(255, 43, 43, 0.2)',
        'vsi-glow-lg': '0 0 60px rgba(255, 43, 43, 0.25)',
        'vsi-glow-btn': '0 0 20px rgba(255, 43, 43, 0.4)',
        'vsi-card': '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 43, 43, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
