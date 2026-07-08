import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        phone: '0 30px 80px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config;
