/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master Design System Colors - UTH Teal
        primary: {
          DEFAULT: '#008B8B',
          hover: '#007A7A',
          dark: '#006F70',
          darker: '#005456',
          light: '#E6F4F3',
          50: '#E6F4F3',
          100: '#CCE7E8',
          200: '#99CFD1',
          300: '#66B8BA',
          400: '#33A0A3',
          500: '#008B8B',
          600: '#007A7A',
          700: '#006F70',
          800: '#005456',
          900: '#003A3C',
        },
        brand: {
          DEFAULT: '#008B8B',
          dark: '#006F70',
          darker: '#005456',
          soft: '#E6F4F3',
          100: '#CCE7E8',
          200: '#99CFD1',
          300: '#66B8BA',
          hover: '#007A7A',
        },
        // Accent Colors - UTH Orange
        accent: {
          DEFAULT: '#ED6C02',
          hover: '#EA580C',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#ED6C02',
          600: '#EA580C',
          700: '#C2410C',
        },
        orange: {
          DEFAULT: '#ED6C02',
          dark: '#D97706',
          soft: '#FFEDD5',
        },
        navy: '#000099',
        // Canvas & Surfaces
        pageBg: '#F3F6F8',
        surface: '#FFFFFF',
        cell: '#F8FAFC',
        line: '#E2E8F0',
        border: '#E2E8F0',
        // Typography & Ink
        textPrimary: '#263238',
        textSecondary: '#64748B',
        textTertiary: '#94A3B8',
        ink: '#263238',
        muted: '#64748B',
        // Semantic Tokens
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          dark: '#DC2626',
          soft: '#FEE2E2',
        },
        success: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          dark: '#15803D',
          soft: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          dark: '#D97706',
          soft: '#FEF3C7',
        },
        info: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          dark: '#2563EB',
          soft: '#DBEAFE',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Be Vietnam Pro"', 'monospace', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 6px 16px -2px rgba(0, 139, 139, 0.08), 0 3px 8px -2px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      maxWidth: {
        container: '1360px',
      },
    },
  },
  plugins: [],
}
