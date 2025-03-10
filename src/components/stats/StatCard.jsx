import React from 'react';

function StatCard({
  title = 'Stat',
  value = '0',
  icon = null,
  className = '',
  valueClassName = 'text-4xl font-light text-gray-600 dark:text-gray-300',
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <button className="text-gray-400 hover:text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </button>
      </div>
      <div className="flex items-end space-x-2">
        <p className={valueClassName}>{value}</p>
        {icon && <div className="mb-1">{icon}</div>}
      </div>
    </div>
  );
}

export default StatCard; 