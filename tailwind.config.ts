import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E4E8C',
          secondary: '#57D4FF',
          accent: '#7AA8FF',
          dark: '#16315F',
          light: '#F7FBFF',
          'primary-light': '#3F75BE',
          'secondary-light': '#CAF2FF',
          'accent-light': '#DCE8FF',
          'accent-dark': '#4E74C8',
          muted: '#C2D0E6',
          'dark-surface': '#204174',
          'dark-card': '#295089',
          'glass-border': 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-manrope)', 'Manrope', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'circuit-pattern': "url('/patterns/circuit.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #16315F 0%, #3F75BE 48%, #57D4FF 100%)',
        'gradient-accent': 'linear-gradient(135deg, #57D4FF 0%, #CAF2FF 100%)',
        'gradient-dark': 'linear-gradient(180deg, #16315F 0%, #204174 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(202,242,255,0.08) 100%)',
      },
      boxShadow: {
        'glow-accent': '0 0 24px rgba(87, 212, 255, 0.32)',
        'glow-primary': '0 0 24px rgba(30, 78, 140, 0.32)',
        'glow-blue': '0 0 32px rgba(122, 168, 255, 0.28)',
        'glass': '0 12px 36px rgba(9, 26, 58, 0.22)',
        'card': '0 8px 28px rgba(12, 32, 69, 0.18)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'circuit-flow': 'circuitFlow 3s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(87, 212, 255, 0.22)' },
          '50%': { boxShadow: '0 0 42px rgba(87, 212, 255, 0.42)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        circuitFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
