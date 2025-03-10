/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
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
        },
        colors: {
          blue: {
            600: '#2563eb', // Adjust this color to match your design if needed
          },
        },
      },
    },
    plugins: [],
  }