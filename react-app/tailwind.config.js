/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          400: '#ff69b4', // Hot pink from previous bootstrap setup
        }
      },
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
