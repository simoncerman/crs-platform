import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CRS Official Brand Colors (from design system)
        'crs-zero': '#000000',
        'crs-sun': '#FFFFFF',
        'crs-base': '#1D00C8',
        'crs-steel': '#222D4A',
        'crs-moonshine': '#9FB1BD',
        'crs-fresh': '#0000FF',
        'crs-neptune': '#4A62A1',
        'crs-funky': '#7F91E3',
        'crs-grey': '#A4B7FB',
        'crs-ignition': '#F3B600',
        
        // Space Theme Colors (complementary)
        'deep-space': '#0a0e27',
        'cosmic-blue': '#1a1f3a',
        'aurora-cyan': '#64f4d2',
        'aurora-blue': '#4d9fff',
        'stellar-white': '#f8f9fc',
        'moon-gray': '#a8b2d1',
        'nebula-purple': '#8b5cf6',
        'solar-orange': '#fb923c',
      },
      fontFamily: {
        heading: ['var(--font-raleway)', 'sans-serif'],
        body: ['var(--font-roboto-slab)', 'serif'],
        accent: ['var(--font-comfortaa)', 'cursive'],
        sans: ['var(--font-roboto-slab)', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(100, 244, 210, 0.3)',
        'glow-blue': '0 0 20px rgba(77, 159, 255, 0.3)',
        'glow-crs': '0 0 30px rgba(29, 0, 200, 0.4)',
        'glow-ignition': '0 0 25px rgba(243, 182, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-crs': 'linear-gradient(135deg, #1D00C8 0%, #4A62A1 50%, #7F91E3 100%)',
        'gradient-ignition': 'linear-gradient(135deg, #F3B600 0%, #fb923c 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
