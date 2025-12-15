/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paid: '#16a34a',
        outstanding: '#ef4444',
        total: '#3b82f6',
      },
    },
  },
  plugins: [],
}
