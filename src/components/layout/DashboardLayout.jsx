import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faComments } from '@fortawesome/free-solid-svg-icons';

function DashboardLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Check if we're on an agent details page
  // The pattern will match paths like /dashboard/agent/123
  const isOnAgentDetailsPage = /\/dashboard\/agent\/[^\/]+$/.test(location.pathname);
  
  // Check if we're already on a chat page
  const isOnChatPage = location.pathname.includes('/chat');
  
  // Determine whether to show the chat button
  const shouldShowChatButton = isOnAgentDetailsPage && !isOnChatPage;
  
  // Get agent ID from path if on agent details page
  const agentId = isOnAgentDetailsPage 
    ? location.pathname.split('/').pop() 
    : null;
  
  // Set up screen size detection with more breakpoints for better responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Update CSS variables for responsive spacing
      document.documentElement.style.setProperty('--navbar-height', '3.5rem'); // 14px / 4 = 3.5rem
      
      // Reduced top padding to minimize space between navbar and content
      document.documentElement.style.setProperty('--content-top-padding', '0.5rem');
      
      // Set different content padding based on screen size
      if (window.innerWidth < 640) { // sm
        document.documentElement.style.setProperty('--content-padding', '0.75rem');
      } else if (window.innerWidth < 768) { // md
        document.documentElement.style.setProperty('--content-padding', '1rem');
      } else if (window.innerWidth < 1024) { // lg
        document.documentElement.style.setProperty('--content-padding', '1.5rem');
      } else { // xl and beyond
        document.documentElement.style.setProperty('--content-padding', '2rem');
      }
    };
    
    // Initial check
    handleResize();
    
    // Set up event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    // Using the custom event that SidebarLayout is already set up to listen for
    document.dispatchEvent(new CustomEvent('toggle-sidebar'));
  };

  // Add a class to the body for targeting the sidebar
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-view');
    } else {
      document.body.classList.remove('mobile-view');
    }
    return () => {
      document.body.classList.remove('mobile-view');
    };
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg transition-colors duration-200">
      {/* Mobile Navigation Bar with all buttons */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm z-40 transition-all">
          <div className="flex items-center justify-between h-full px-4">
            {/* Spacer div to replace logo and maintain layout */}
            <div className="w-5"></div>
            
            {/* Action Buttons - Both Chat and Hamburger */}
            <div className="flex items-center space-x-3">
              {/* Chat Button - Only show on agent details pages */}
              {shouldShowChatButton && (
                <Link 
                  to={`/chat/${agentId}`}
                  className="p-2 rounded-md text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
                  aria-label="Chat with Agent"
                >
                  <FontAwesomeIcon icon={faComments} className="h-4 w-4 mr-1" />
                  <span className="text-sm">Chat</span>
                </Link>
              )}
              
              {/* Menu Toggle Button */}
              <button 
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors"
                onClick={toggleSidebar}
                aria-label="Toggle Menu"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      )}
      
      {/* CSS for responsive layout and proper spacing */}
      <style jsx global>{`
        :root {
          --navbar-height: 3.5rem;
          --content-top-padding: 0.5rem;
          --content-padding: 1.5rem;
        }
        
        /* Ensure the sidebar appears in front of the navbar */
        @media (max-width: 767px) {
          /* Adjust the sidebar to appear in front of navbar */
          body.mobile-view aside {
            z-index: 50 !important; /* Higher than navbar */
            top: 0 !important; /* Start from top of screen */
            height: 100% !important; /* Full height */
          }
          
          /* Move the hamburger menu toggle button to the front */
          body.mobile-view .fixed[aria-label="Open sidebar"],
          body.mobile-view .fixed[aria-label="Close sidebar"] {
            z-index: 60 !important; /* Above sidebar */
          }
          
          /* Ensure dark overlay has correct z-index */
          body.mobile-view .fixed.inset-0.bg-gray-900 {
            z-index: 45 !important; /* Between navbar and sidebar */
          }
          
          /* Hide the SidebarToggle component since we're using our navbar button */
          body.mobile-view .fixed[aria-label="Open sidebar"] {
            display: none !important;
          }
          
          /* Reduced spacing for main content area to prevent content from going behind navbar */
          body.mobile-view main {
            padding-top: calc(var(--navbar-height) + var(--content-top-padding)) !important;
          }
          
          /* Adjust content wrapper padding to be more compact */
          body.mobile-view main > div {
            padding-left: var(--content-padding) !important;
            padding-right: var(--content-padding) !important;
            padding-top: 0 !important; /* Remove extra top padding */
            padding-bottom: var(--content-padding) !important;
          }
          
          /* Even tighter spacing for small screens */
          @media (max-width: 639px) {
            :root {
              --content-top-padding: 0.25rem;
            }
            
            body.mobile-view main > div {
              padding-left: 0.75rem !important;
              padding-right: 0.75rem !important;
              padding-bottom: 0.75rem !important;
            }
          }
        }
      `}</style>
      
      {/* Main Content */}
      <SidebarLayout ref={sidebarRef}>
        <Outlet />
      </SidebarLayout>
    </div>
  );
}

export default DashboardLayout;