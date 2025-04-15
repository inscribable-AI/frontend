import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faKey } from '@fortawesome/free-solid-svg-icons';

export default function AgentCard({ agent, isSelected, onSelect, layout = 'grid' }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [showDetails, setShowDetails] = useState(false);

  const getAgentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
      case 'busy':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Handle card layout based on grid or list view
  if (layout === 'list') {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
          isSelected 
            ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/50 dark:ring-primary-400/50' 
            : 'border-gray-200 dark:border-gray-700'
        } hover:shadow-md transition-shadow duration-300 p-4 relative cursor-pointer`}
        onClick={() => onSelect(agent)}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-full sm:max-w-[80%]">
                {agent.name}
              </h3>
              {agent.status && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getAgentStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              )}
              {agent.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {agent.category.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            
            {/* Agent description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {agent.description || "No description available"}
            </p>
          </div>
          
          {/* Abilities badge */}
          {Array.isArray(agent.abilities) && agent.abilities.length > 0 && (
            <div className="shrink-0 self-center mt-1 sm:mt-0">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg whitespace-nowrap">
                <span>{agent.abilities.length} {agent.abilities.length === 1 ? 'ability' : 'abilities'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
        isSelected 
          ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/50 dark:ring-primary-400/50' 
          : 'border-gray-200 dark:border-gray-700'
      } hover:shadow-md transition-shadow duration-300 relative cursor-pointer`}
      onClick={() => onSelect(agent)}
    >
      <div className="p-5">
        {/* Header with agent name and status badge */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate max-w-full sm:max-w-[70%]">
            {agent.name}
          </h3>
          {agent.status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getAgentStatusColor(agent.status)}`}>
              {agent.status}
            </span>
          )}
        </div>
        
        {/* Category badge */}
        {agent.category && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap">
              {agent.category.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        
        {/* Agent description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {agent.description || "No description available"}     
        </p>        
        
        {/* Toggle details button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card selection when clicking the details button
            setShowDetails(!showDetails);
          }}
          className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        {/* Details section (only visible when expanded) */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Abilities */}
            {Array.isArray(agent.abilities) && agent.abilities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <FontAwesomeIcon icon={faKey} className="mr-2 text-primary-600 dark:text-primary-400" />
                  Abilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {agent.abilities.map((ability, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tools - Only visible when authenticated */}
            {isAuthenticated && Array.isArray(agent.tools) && agent.tools.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Tools
                </h4>
                <ul className="space-y-1">
                  {agent.tools.map((tool, index) => (
                    <li key={index} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                      <span className="font-medium">{tool.name}</span>: {tool.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 