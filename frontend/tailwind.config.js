/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f6f3',
          700: '#1f4d33',
          800: '#173d28',
          900: '#0f2e1c'
        }
      }
    }
  },
  plugins: []
};
