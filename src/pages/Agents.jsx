import React, { useState, useEffect } from 'react';
import { useAgents } from '../hooks/useAgents';
import PageWrapper from '../components/layout/PageWrapper';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CreateTeam } from '../components/CreateTeam';
import { AgentList } from '../components/AgentList';
import { SearchBar } from '../components/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faUsers } from '@fortawesome/free-solid-svg-icons';

function Agents() {
  const { agents, categories, isLoading } = useAgents();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Set initial active category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory('All');
    }
  }, [categories]);
  
  // Add 'All' category to the categories list
  const allCategories = ['All', ...categories];
  
  // Filter agents by search query
  const filteredBySearch = !searchQuery 
    ? agents 
    : agents.filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agent.category && agent.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Filter by category
  const filteredAgents = activeCategory === 'All' 
    ? filteredBySearch 
    : filteredBySearch.filter(agent => agent.category === activeCategory);
  
  const handleAgentSelect = (agent) => {
    setSelectedAgents(prev => {
      const isSelected = prev.some(a => a.id === agent.id);
      if (isSelected) {
        return prev.filter(a => a.id !== agent.id);
      } else {
        return [...prev, agent];
      }
    });
  };

  const handleCreateTeam = async (teamData) => {
    setIsSubmitting(true);
    try {
      // API call to create team would go here
      toast.success('Team created successfully');
      setIsCreateTeamModalOpen(false);
      setSelectedAgents([]); // Clear selection after successful creation
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section with title and search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FontAwesomeIcon 
                icon={faRobot} 
                className="mr-3 text-primary-600 dark:text-primary-400" 
              />
              Agents
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Browse and select agents to create or add to a team
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-4 md:mt-0">
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              placeholder="Search for agents..."
            />
          </div>
        </div>
        
        {/* Category filters and Create Team button on the same row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="overflow-x-auto w-full sm:w-auto">
            <div className="flex space-x-2 pb-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-primary-100 text-black dark:bg-primary-900/30 dark:text-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Create Team button - now next to category filters */}
          <button
            onClick={() => setIsCreateTeamModalOpen(true)}
            disabled={selectedAgents.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              selectedAgents.length > 0
                ? 'text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                : 'text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            Create Team ({selectedAgents.length})
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>
        ) : (
          <>
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faRobot} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No agents found</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <AgentList
                agents={filteredAgents}
                selectedAgents={selectedAgents}
                onAgentSelect={handleAgentSelect}
                layout={viewMode}
                className="mt-6"
              />
            )}
          </>
        )}
      </div>

      {/* Create Team Modal */}
      {isCreateTeamModalOpen && (
        <CreateTeam
          agents={selectedAgents}
          onClose={() => setIsCreateTeamModalOpen(false)}
          onCreateTeam={handleCreateTeam}
          isSubmitting={isSubmitting}
        />
      )}
    </PageWrapper>
  );
}

export default Agents; 