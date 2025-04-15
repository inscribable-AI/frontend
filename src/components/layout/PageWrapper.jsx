import React, { useEffect, useState } from 'react';

function PageWrapper({ children }) {
  // Track sidebar state
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    // Initial state from localStorage
    const savedState = localStorage.getItem('sidebarOpen');
    setSidebarOpen(savedState === null ? true : savedState === 'true');
    
    // Listen for sidebar state changes
    const handleStorageChange = () => {
      const updatedState = localStorage.getItem('sidebarOpen');
      setSidebarOpen(updatedState === 'true');
    };
    
    // Listen for custom event
    const handleSidebarChange = (e) => {
      setSidebarOpen(e.detail.isOpen);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebarStateChange', handleSidebarChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarStateChange', handleSidebarChange);
    };
  }, []);

  return (
    <div 
      className={`flex flex-col flex-1 page-wrapper ${
        isSidebarOpen ? '' : 'sidebar-collapsed'
      }`}
      style={{ marginTop: 0, paddingTop: 0 }}
    >
      {/* Mobile header spacing - minimum height */}
      <div className="md:hidden h-4" style={{ marginBottom: 0 }} />
      
      <main className="flex-1" style={{ paddingTop: 0, marginTop: 0 }}>
        <div style={{ paddingTop: 0, marginTop: 0, paddingBottom: '1.5rem' }}>
          <div 
            className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 ${
              isSidebarOpen ? '' : 'md:pl-0 md:pr-8'
            }`}
            style={{ paddingTop: 0, marginTop: 0 }}
          >
            <div style={{ paddingTop: 0, marginTop: 0 }}>
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageWrapper; 