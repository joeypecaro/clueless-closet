import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system tokens
        background: '#FAFAF8',
        surface: '#FFFFFF',
        'surface-raised': '#F2F2EF',
        text: {
          primary: '#1C1C1E',
          secondary: '#636366',
          tertiary: '#AEAEB2',
          inverse: '#FFFFFF',
        },
        accent: {
          yellow: '#F5C400',
          'yellow-light': '#FEF3B0',
          'yellow-dark': '#C49D00',
          pink: '#F9C8D4',
          'pink-dark': '#E8849A',
        },
        neutral: {
          50: '#FAFAF8',
          100: '#F2F2EF',
          200: '#E5E5E0',
          300: '#D1D1C8',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#1C1C1E',
        },
        success: '#34C759',
        warning: '#FF9F0A',
        error: '#FF3B30',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(0,0,0,0.06)',
        'card-raised': '0 4px 24px 0 rgba(0,0,0,0.10)',
        'sheet': '0 -4px 32px 0 rgba(0,0,0,0.12)',
        'tab': '0 -1px 0 0 rgba(0,0,0,0.06)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'tab-bar': '68px',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
} satisfies Config
