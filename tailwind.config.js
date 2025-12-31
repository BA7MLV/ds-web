/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'ui-sans-serif',
          'sans-serif',
        ],
        display: [
          '"Noto Serif SC"',
          '"Songti SC"',
          'serif',
        ],
        serif: ['"Noto Serif SC"', '"Songti SC"', 'serif'],
        handwritten: [
          '"Ma Shan Zheng"',
          '"Bradley Hand"',
          '"Segoe Print"',
          '"Apple Chancery"',
          'cursive',
        ],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.9s ease forwards',
      },
    },
  },
  plugins: [],
}
