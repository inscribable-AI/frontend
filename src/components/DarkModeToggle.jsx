import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun icon */}
      <svg
        className={`w-5 h-5 transform transition-all duration-300 ${
          isDarkMode ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        } absolute text-yellow-500`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon icon */}
      <svg
        className={`w-5 h-5 transform transition-all duration-300 ${
          isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        } absolute text-blue-200`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Focus ring - visible only on keyboard focus */}
      <span className="absolute inset-0 rounded-lg ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-blue-400 focus-visible:ring-2" />
    </button>
  );
}

export default DarkModeToggle; 