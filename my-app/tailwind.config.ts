import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ecyce: {
          primary: '#0055D4', // Primary blue
          navy: '#001A33',    // Deep Navy
          light: '#F0F7FF',   // Light Blue Background
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;