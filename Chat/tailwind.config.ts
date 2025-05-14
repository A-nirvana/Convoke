import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        overlayFade: {
          '0%': { backgroundColor: 'transparent' },
          '100%': { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, // or any desired color
        },
      },
      animation: {
        'overlay-fade': 'overlayFade 300ms ease forwards 150ms',
      },
    },
  },
  plugins: [],
} satisfies Config
