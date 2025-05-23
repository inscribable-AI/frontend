import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import DarkModeToggle from '../DarkModeToggle';

function LandingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-gray-900 dark:text-white">
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default LandingLayout; 