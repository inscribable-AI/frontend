import React from 'react';

function PageWrapper({ children }) {
  return (
    <div className="flex flex-col flex-1">
      {/* Mobile header spacing */}
      <div className="md:hidden h-16" />
      
      <main className="flex-1">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Removed excessive left padding, kept mobile margin */}
            <div className="mt-8 md:mt-0">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageWrapper; 