/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E14',
        slate: {
          DEFAULT: '#141922',
          light: '#1C2330',
          border: '#252D3D',
        },
        fog: '#8A93A6',
        paper: '#EDEFF3',
        signal: {
          DEFAULT: '#4FF5C4',
          dim: '#2C9A7C',
        },
        amber: {
          DEFAULT: '#F5A623',
          dim: '#B87A1A',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Arial Narrow"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        scan: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        scan: 'scan 3s linear infinite',
        pulseGlow: 'pulseGlow 1.6s ease-in-out infinite',
        rise: 'rise 0.5s ease-out both',
      },
      boxShadow: {
        glow: '0 0 24px rgba(79, 245, 196, 0.25)',
      },
    },
  },
  plugins: [],
};
