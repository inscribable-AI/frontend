import React from 'react';
import Footer from './Footer';

function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-gray-900 dark:text-white">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout; 