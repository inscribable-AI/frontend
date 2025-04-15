import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { SearchBar } from '../components/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScrewdriverWrench, faRobot } from '@fortawesome/free-solid-svg-icons';
import { toolAPI } from '../services/api';
import CreateAgentModal from '../components/modals/CreateAgentModal';
import { ToolList } from '../components/ToolList';

// Mock data - Replace with API call when ready
const mockTools = [
  {
    category: "Bitcoin",
    id: "BT_006",
    name: "getUserUnspentTransaction",
    description: "Get the unspent transactions of the given address",
    credentials: {
      BITCOIN_PASSPHRASE: "BITCOIN PASSPHRASE",
    }
  },
  {
    category: "Ethereum",
    id: "ETH_002",
    name: "getEthereumBalance",
    description: "Get the balance of an Ethereum wallet address",
    credentials: {
      ETHEREUM_API_KEY: "ETHEREUM API KEY",
    }
  },
  {
    category: "AWS",
    id: "AWS_023",
    name: "createS3Bucket",
    description: "Create a new S3 storage bucket in your AWS account",
    credentials: {
      AWS_ACCESS_KEY: "AWS ACCESS KEY",
      AWS_SECRET_KEY: "AWS SECRET KEY",
    }
  },
  {
    category: "Google",
    id: "GGL_017",
    name: "translateText",
    description: "Translate text from one language to another using Google Translate API",
    credentials: {
      GOOGLE_API_KEY: "GOOGLE API KEY",
    }
  }
];

function Tools() {
  const [tools, setTools] = useState(mockTools);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedTools, setSelectedTools] = useState([]);
  const [createAgentModalOpen, setCreateAgentModalOpen] = useState(false);
  
  // Get unique categories from tools
  const categories = ['All', ...new Set(tools.map(tool => tool.category))];
  
  // Filter by search query
  const filteredBySearch = !searchQuery 
    ? tools 
    : tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Filter by category
  const filteredTools = activeCategory === 'All' 
    ? filteredBySearch 
    : filteredBySearch.filter(tool => tool.category === activeCategory);
  
  // Fetch tools data - replace with actual API call
  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      try {
        const response = await toolAPI.getTools();
        setTools(response.data);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTools();
    
  }, []);
  
  // Handle tool selection
  const handleToolSelect = (tool) => {
    setSelectedTools(prev => {
      const isSelected = prev.some(t => t.id === tool.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tool.id);
      } else {
        return [...prev, tool];
      }
    });
  };

  // Check if a tool is selected
  const isToolSelected = (toolId) => {
    return selectedTools.some(tool => tool.id === toolId);
  };
  
  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section with title and search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FontAwesomeIcon 
                icon={faScrewdriverWrench} 
                className="mr-3 text-primary-600 dark:text-primary-400" 
              />
              Tools
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Browse and use tools to enhance your agents capabilities
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-4 md:mt-0">
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              placeholder="Search for tools..."
            />
          </div>
        </div>
        
        {/* Category filters and Create Agent button on the same row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="overflow-x-auto w-full sm:w-auto">
            <div className="flex space-x-2 pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-primary-100 !text-black dark:bg-primary-900/30 dark:!text-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Create Agent button */}
          <button
            onClick={() => setCreateAgentModalOpen(true)}
            disabled={selectedTools.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              selectedTools.length > 0
                ? 'text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                : 'text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faRobot} className="mr-2" />
            Create Agent ({selectedTools.length})
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>
        ) : (
          <>
            {filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faScrewdriverWrench} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tools found</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <ToolList
                tools={filteredTools}
                selectedTools={selectedTools}
                onToolSelect={handleToolSelect}
                layout={viewMode}
                className="mt-6"
              />
            )}
          </>
        )}
      </div>

      {/* Create Agent Modal */}
      {createAgentModalOpen && (
        <CreateAgentModal
          isOpen={createAgentModalOpen}
          onClose={() => setCreateAgentModalOpen(false)}
          selectedTools={selectedTools}
        />
      )}
    </PageWrapper>
  );
}

export default Tools; 