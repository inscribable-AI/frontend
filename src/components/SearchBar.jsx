import React from 'react';

export function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode,
  placeholder = "Search for agents...",
  showViewToggle = true
}) {
  return (
    <div className="max-w-3xl mx-auto mb-12">
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-10 text-gray-800 dark:text-gray-100 bg-transparent outline-none placeholder-gray-500 dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {showViewToggle && (
          <div className="flex items-center gap-2 pr-2">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full ${viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full ${viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 