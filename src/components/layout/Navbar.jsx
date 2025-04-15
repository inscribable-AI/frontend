import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faSignInAlt, faUserPlus, faTachometerAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import DarkModeToggle from '../DarkModeToggle';
import { AuthContext } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import blackLogo from '../../assets/black-logo.svg';
import whiteLogo from '../../assets/white-logo.svg';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const location = useLocation();
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-dark-surface shadow-md fixed w-full top-0 z-50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section with logo and burger menu */}
          <div className="flex items-center">
            {/* Mobile menu button - moved to left of logo */}
            <div className="flex sm:hidden mr-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
                <FontAwesomeIcon 
                  icon={isOpen ? faTimes : faBars} 
                  className="h-5 w-5" 
                  aria-hidden="true" 
                />
              </button>
            </div>
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-primary-500 dark:text-primary-400 text-xl font-bold flex items-center">
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
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 lg:space-x-8">
              <Link 
                to="/" 
                className={`border-b-2 ${location.pathname === '/' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:border-gray-300 dark:hover:border-gray-600'
                } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className={`border-b-2 ${location.pathname === '/features' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:border-gray-300 dark:hover:border-gray-600'
                } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className={`border-b-2 ${location.pathname === '/pricing' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:border-gray-300 dark:hover:border-gray-600'
                } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`}
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right section */}
          <div className="hidden sm:flex sm:items-center sm:space-x-3">
            <DarkModeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Sign out"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/signin" 
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                  Sign in
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors shadow-sm"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Right actions for mobile */}
          <div className="flex items-center sm:hidden">
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Mobile menu - Animated slide down */}
      <div 
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border px-2 pb-3">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/' 
                  ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/10' 
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/features' 
                  ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/10' 
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/pricing' 
                  ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/10' 
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
              }`}
            >
              Pricing
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-dark-border">
            {isAuthenticated ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <span className="text-sm font-medium">U</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white truncate">User</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">user@example.com</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-gray-100 dark:hover:bg-dark-elevated"
                  >
                    <FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5 h-5" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-dark-elevated"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5 h-5" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-4 py-2">
                <Link
                  to="/signin"
                  className="w-full px-4 py-2 text-center rounded-md text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="w-full px-4 py-2 text-center rounded-md text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 