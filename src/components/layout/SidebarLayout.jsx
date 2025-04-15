import React, { useState, useEffect, forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DarkModeToggle from '../DarkModeToggle';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faScrewdriverWrench, 
  faChevronLeft, 
  faChevronRight, 
  faSignOutAlt, 
  faBars,
  faUser,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useDarkMode } from '../../contexts/DarkModeContext';
import blackLogo from '../../assets/black-logo.svg';
import whiteLogo from '../../assets/white-logo.svg';

// Mobile sidebar toggle button needs to be repositioned as well
const SidebarToggle = ({ isOpen, toggle }) => (
  <button
    onClick={toggle}
    className="fixed top-3 left-4 z-50 md:hidden p-2 rounded-md bg-white dark:bg-dark-surface shadow-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-elevated transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-30"
    aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
  >
    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { isDarkMode } = useDarkMode();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Monitor screen size changes to adapt sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || 
             location.pathname.startsWith('/dashboard/team') ||
             location.pathname.includes('/team/');
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout successful');
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleTeamClick = (e) => {
    e.preventDefault();
    const teamsSection = document.getElementById('teams');
    if (teamsSection) {
      teamsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigationItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      path: '/dashboard/agents', 
      label: 'Agents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
      ),
      subItems: [
        {
          path: '/dashboard/tool-agents',
          label: 'Tool Agents',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          path: '/dashboard/super-agents',
          label: 'Super Agents',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
          )
        }
      ]
    },
    { 
      path: '/dashboard/tools', 
      label: 'Tools',
      icon: (
        <FontAwesomeIcon icon={faScrewdriverWrench} />
      )
    },
    { 
      path: '/dashboard/credentials', 
      label: 'Credentials',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    },
    { 
      path: '/dashboard/account', 
      label: 'Account',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      path: '/dashboard/billing', 
      label: 'Billing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Dark overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with fixed position - updated to start from top of screen */}
      <aside className={`fixed top-0 bottom-0 left-0 z-30 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${
        isOpen ? 'w-[280px] sm:w-64' : 'w-0 md:w-16'
      } bg-white dark:bg-dark-surface shadow-lg transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}>
        {/* Logo section at top of sidebar */}
        <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
          {isOpen ? (
            <>
              <Link to="/" className="text-primary-500 dark:text-primary-400 text-xl font-bold transition-colors flex items-center">
                {isDarkMode ? (
                  <img 
                    src={whiteLogo} 
                    alt="Logo" 
                    className="h-6 w-auto" 
                    onError={(e) => {
                      console.error("White logo failed to load");
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <img 
                    src={blackLogo} 
                    alt="Logo" 
                    className="h-6 w-auto" 
                    onError={(e) => {
                      console.error("Black logo failed to load");
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </Link>
              {/* Show close button on mobile or desktop collapse button */}
              {isMobile ? (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
              <button 
                onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                aria-label="Collapse sidebar"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              )}
            </>
          ) : (
            // Only show expand button on desktop, not mobile
            <button 
              onClick={() => setIsOpen(true)}
              className="mx-auto p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 hidden md:block"
              aria-label="Expand sidebar"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation with improved spacing */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path} className="group">
                  <Link
                    to={item.path}
                    className={`flex items-center ${isOpen ? 'px-4 py-3' : 'px-2 py-3 justify-center'} text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                    title={item.label}
                  >
                    <span className={`${isOpen ? 'mr-3' : ''} transition-colors duration-200 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>
                      {item.icon}
                    </span>
                    {isOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
                    {isOpen && item.subItems && (
                      <svg 
                        className={`ml-auto w-4 h-4 transition-transform duration-200 ${active ? 'rotate-180 text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>
                  {isOpen && item.subItems && active && (
                    <ul className="mt-1.5 ml-6 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path} className="group">
                          <Link
                            to={subItem.path}
                            onClick={subItem.onClick || undefined}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname.startsWith(subItem.path)
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-600 dark:hover:text-primary-400'
                            }`}
                          >
                            <span className={`mr-3 transition-colors duration-200 ${
                              location.pathname.startsWith(subItem.path) 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                            }`}>
                              {subItem.icon}
                            </span>
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with responsive design */}
        {isOpen ? (
          <div className="border-t border-gray-100 dark:border-dark-border p-4">
            <div className="flex flex-col space-y-4">
              {/* User Profile */}
              <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    User Profile
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    user@example.com
                  </p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DarkModeToggle />
                  <button 
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                    aria-label="Settings"
                  >
                    <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                    aria-label="Logout"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 dark:border-dark-border p-2 flex flex-col items-center space-y-4">
            <DarkModeToggle />
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
              aria-label="Logout"
              title="Logout"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

// Updated SidebarLayout component with spacing removed
const SidebarLayout = forwardRef((props, ref) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toggle function for the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // Expose the toggleSidebar method via ref
  React.useImperativeHandle(ref, () => ({
    toggleSidebar
  }));
  
  // Also listen for the custom event as a fallback
  useEffect(() => {
    const handleToggleEvent = () => {
      toggleSidebar();
    };
    
    // Listen for toggle event
    document.addEventListener('toggle-sidebar', handleToggleEvent);
    
    // Cleanup
    return () => {
      document.removeEventListener('toggle-sidebar', handleToggleEvent);
    };
  }, []);

  // Auto-collapse sidebar on mobile when viewport changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Update localStorage and dispatch events when sidebar state changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
    
    // Dispatch custom event for PageWrapper to listen to
    window.dispatchEvent(new CustomEvent('sidebarStateChange', {
      detail: { isOpen: isSidebarOpen }
    }));
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-bg transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main content without extra top spacing */}
      <main 
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`} 
      >
        {/* Content wrapper */}
        <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
          {props.children}
        </div>
      </main>
    </div>
  );
});

export default SidebarLayout;