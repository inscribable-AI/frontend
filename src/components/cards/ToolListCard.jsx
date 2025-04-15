import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const ToolListCard = ({ tool, isSelected, onSelect, selectable }) => {
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
      } hover:shadow-md transition-shadow duration-300 p-4 relative ${
        selectable ? 'cursor-pointer' : ''
      }`}
      onClick={selectable ? () => onSelect(tool) : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Tool name, ID and category - improved for responsiveness */}
        <div className="flex-grow min-w-0"> {/* min-w-0 allows text truncation to work */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-full sm:max-w-[80%]">
              {tool.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(tool.category)}`}>
              {tool.category}
            </span>
          </div>
          
          {/* Tool description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
            {tool.description}
          </p>
        </div>
        
        {/* Credentials badge */}
        {tool.credentials && Object.keys(tool.credentials).length > 0 && (
          <div className="shrink-0 self-center mt-1 sm:mt-0">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg whitespace-nowrap">
              <FontAwesomeIcon icon={faKey} className="mr-2 text-primary-600 dark:text-primary-400" />
              <span>{Object.keys(tool.credentials).length} credential{Object.keys(tool.credentials).length > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ToolListCard.propTypes = {
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

ToolListCard.defaultProps = {
  isSelected: false,
  onSelect: () => {},
  selectable: false
};

export default ToolListCard; 