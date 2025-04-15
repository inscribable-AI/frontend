import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools, faKey, faInfoCircle, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const ToolCard = ({ tool, isSelected, onSelect, selectable }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(tool.id);
    toast.success('Tool ID copied to clipboard');
  };

  // Different background colors based on category
  const getCategoryColor = (category) => {
    const categories = {
      'Bitcoin': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      'Ethereum': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      'AWS': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      'Google': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      'Sonic': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      'Trading': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    };
    
    return categories[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
        isSelected 
          ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/50 dark:ring-primary-400/50' 
          : 'border-gray-200 dark:border-gray-700'
      } hover:shadow-md transition-shadow duration-300 relative ${
        selectable ? 'cursor-pointer' : ''
      }`}
      onClick={selectable ? () => onSelect(tool) : undefined}
    >
      <div className="p-5">
        {/* Header with tool name and category badge - improved for responsiveness */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate max-w-full sm:max-w-[70%]">
            {tool.name}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(tool.category)}`}>
            {tool.category}
          </span>
        </div>
        
        {/* Tool description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {tool.description}
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
        
        {/* Credentials section (only visible when expanded) */}
        {showDetails && tool.credentials && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <FontAwesomeIcon icon={faKey} className="mr-2 text-primary-600 dark:text-primary-400" />
              Required Credentials
            </h4>
            <ul className="space-y-1">
              {Object.entries(tool.credentials).map(([key, value]) => (
                <li key={key} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                  <span className="font-mono break-all">{key}</span>: {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

ToolCard.propTypes = {
  tool: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    credentials: PropTypes.object
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  selectable: PropTypes.bool
};

ToolCard.defaultProps = {
  isSelected: false,
  onSelect: () => {},
  selectable: false
};

export default ToolCard; 