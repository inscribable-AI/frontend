import React from 'react';

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  currentPageFirstItemIndex,
  currentPageLastItemIndex
}) {
  // Generate page numbers to display
  const getVisiblePageNumbers = () => {
    const maxPagesToShow = 5; // Adjust based on screen size
    const pages = [];
    
    // Small screens - just show current, prev, next
    if (window.innerWidth < 640) {
      return [currentPage];
    }
    
    // Medium screens - show fewer pages
    const range = window.innerWidth < 768 ? 1 : 2;
    
    // Start and end of visible page range
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);
    
    // Adjust if at the beginning or end
    if (currentPage <= range + 1) {
      end = Math.min(totalPages, maxPagesToShow);
    } else if (currentPage >= totalPages - range) {
      start = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm">
      <div className="mb-2 sm:mb-0 text-gray-600 dark:text-gray-400">
        Showing {currentPageFirstItemIndex} to {currentPageLastItemIndex} of {totalItems} items
      </div>
      
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="sr-only">First</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Page numbers - responsive */}
        <div className="hidden sm:flex">
          {getVisiblePageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        {/* Current page indicator for small screens */}
        <span className="sm:hidden px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        
        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="sr-only">Last</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0L10 11.414l4.293 4.293a1 1 0 001.414-1.414l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 000 1.414z" clipRule="evenodd" transform="rotate(90 10 10)" />
            <path fillRule="evenodd" d="M12.293 15.707a1 1 0 001.414 0L18 11.414l4.293 4.293a1 1 0 001.414-1.414l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 000 1.414z" clipRule="evenodd" transform="rotate(90 18 10)" />
          </svg>
        </button>
      </div>
    </div>
  );
} 