import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: '#03050a',
        mist: '#e8eef7',
        aurora: {
          cyan: '#67e8f9',
          violet: '#a78bfa',
          rose: '#fb7185',
        },
      },
      boxShadow: {
        phone: '0 30px 80px rgba(15, 23, 42, 0.45)',
        glass: '0 32px 100px rgba(0, 0, 0, 0.48)',
        glow: '0 0 40px rgba(103, 232, 249, 0.18)',
      },
      borderRadius: {
        hero: '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
