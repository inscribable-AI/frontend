import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import DarkModeToggle from '../DarkModeToggle';

function LandingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-grow pt-24 dark:text-white">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default LandingLayout; 