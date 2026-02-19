/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: '#FFC107',
        bgDark: '#121212',
        surface: '#1E1E1E',
        textSecondary: '#B0B0B0',
        success: '#4CAF50',
        danger: '#EF4444',
        info: '#3B82F6',
      },
    },
  },
  plugins: [],
};
