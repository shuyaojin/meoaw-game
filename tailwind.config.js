/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cat-pink': '#ffb7b2',
        'cat-white': '#fff0f5',
        'cat-dark': '#4a4a4a',
        'cat-accent': '#ff9aa2',
      },
      fontFamily: {
        'sans': ['"Comic Sans MS"', '"Chalkboard SE"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
