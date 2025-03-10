import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function AgentCard({ agent, isSelected, onSelect, layout = 'grid' }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(false);

  console.log(agent);

  const getAgentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleClick = (e) => {
    if (!e.target.closest('.dropdown-toggle')) {
      onSelect();
    }
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 rounded-lg border cursor-pointer
        ${isSelected
          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
        transition-all duration-200
        hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50
        ${layout === 'list' ? 'flex items-center justify-between' : ''}
      `}
    >
      <div className={`${layout === 'list' ? 'flex-1 flex items-center gap-4' : ''}`}>
        {/* Agent Icon/Avatar */}
        <div className={`
          ${layout === 'list' ? 'flex-shrink-0' : 'mb-3'}
          w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 
          flex items-center justify-center
        `}>
          <svg 
            className="w-6 h-6 text-indigo-500/70 dark:text-indigo-400/70" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" 
            />
          </svg>
        </div>

        <div className="flex-1">
          {/* Agent Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-between flex-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                {agent.name}
              </h3>
              <button
                className="dropdown-toggle ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={handleDropdownClick}
              >
                <ChevronDownIcon 
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className={`flex gap-2 ${layout === 'list' ? 'items-center' : 'flex-wrap'}`}>
            {agent.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {agent.category.replace(/_/g, ' ')}
              </span>
            )}
            {agent.status && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAgentStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            )}
          </div>

          {/* Dropdown Content */}
          {isExpanded && (
            <div className="mt-4 space-y-4 border-t pt-4 dark:border-gray-700">
              {/* Abilities */}
              {Array.isArray(agent.abilities) && agent.abilities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" 
                      />
                    </svg>
                    Abilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.abilities.map((ability, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10
                          dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-600/20
                          transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                      >
                        <svg 
                          className="mr-1.5 h-2 w-2 text-indigo-400" 
                          fill="currentColor" 
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools - Only visible when authenticated */}
              {isAuthenticated && Array.isArray(agent.tools) && agent.tools.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tools
                  </h4>
                  <div className="space-y-2">
                    {agent.tools.map((tool, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg 
                          className="w-4 h-4 mt-0.5 text-gray-400 dark:text-gray-500" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {tool.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <svg
            className="h-5 w-5 text-indigo-500 dark:text-indigo-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
} 