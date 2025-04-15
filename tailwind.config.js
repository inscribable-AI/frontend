/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        animation: {
          'float-slow': 'float 8s ease-in-out infinite',
          'float-medium': 'float 6s ease-in-out infinite',
          'float-fast': 'float 4s ease-in-out infinite',
          'bounce-slow': 'bounce 3s infinite',
          'bounce-medium': 'bounce 2.5s infinite 0.2s',
          'bounce-fast': 'bounce 2s infinite 0.4s',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0) scale(1)' },
            '50%': { transform: 'translateY(-20px) scale(1.05)' },
          },
        },
        colors: {
          primary: {
            50: 'var(--color-primary-50)',
            100: 'var(--color-primary-100)',
            200: 'var(--color-primary-200)',
            300: 'var(--color-primary-300)',
            400: 'var(--color-primary-400)',
            500: 'var(--color-primary-500)',
            600: 'var(--color-primary-600)',
            700: 'var(--color-primary-700)',
            800: 'var(--color-primary-800)',
            900: 'var(--color-primary-900)',
            950: 'var(--color-primary-950)',
          },
          'secondary-light': {
            50: 'var(--color-secondary-light-50)',
            100: 'var(--color-secondary-light-100)',
            200: 'var(--color-secondary-light-200)',
            300: 'var(--color-secondary-light-300)',
            400: 'var(--color-secondary-light-400)',
            500: 'var(--color-secondary-light-500)',
            600: 'var(--color-secondary-light-600)',
            700: 'var(--color-secondary-light-700)',
            800: 'var(--color-secondary-light-800)',
            900: 'var(--color-secondary-light-900)',
          },
          'secondary-dark': {
            50: 'var(--color-secondary-dark-50)',
            100: 'var(--color-secondary-dark-100)',
            200: 'var(--color-secondary-dark-200)',
            300: 'var(--color-secondary-dark-300)',
            400: 'var(--color-secondary-dark-400)',
            500: 'var(--color-secondary-dark-500)',
            600: 'var(--color-secondary-dark-600)',
            700: 'var(--color-secondary-dark-700)',
            800: 'var(--color-secondary-dark-800)',
            900: 'var(--color-secondary-dark-900)',
          },
          dark: {
            bg: 'var(--color-dark-bg)',
            surface: 'var(--color-dark-surface)',
            border: 'var(--color-dark-border)',
            elevated: 'var(--color-dark-elevated)',
          }
        },
        fontFamily: {
          sans: ['"TT Firs Neue"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'],
        },
        backgroundColor: {
          'gray-900': '#0c020d',
          'gray-800': '#1a0a1d',
          'gray-700': '#2a1e2c',
        },
        borderColor: {
          'gray-700': '#3a2e3c',
        }
      },
    },
    plugins: [],
  }