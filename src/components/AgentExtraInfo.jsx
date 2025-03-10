import React from 'react';

export function AgentExtraInfo({ agent }) {
  if (!agent || agent.teamProvision !== 1) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg 
            className="w-5 h-5 text-gray-500 dark:text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Agent Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Classification
            </h4>
            <ul className="space-y-1">
              {agent.classification?.map((item, index) => (
                <li 
                  key={index}
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tools
            </h4>
            <ul className="space-y-2">
              {agent.tools?.map((tool, index) => (
                <li key={index} className="text-sm">
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {tool.name}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                    {tool.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {agent.category && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Category
            </h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {agent.category.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 