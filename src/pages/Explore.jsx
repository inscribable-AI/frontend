import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgents, usePreBuiltAgents } from '../hooks/useAgents';
import { AgentList } from '../components/AgentList';
import LandingLayout from '../components/layout/LandingLayout';
import { AuthContext } from '../contexts/AuthContext';
import { CreateTeam } from '../components/CreateTeam';
import { SearchBar } from '../components/SearchBar';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faRobot, faUserGroup, faTools, faFilter } from '@fortawesome/free-solid-svg-icons';
import AgentCard from '../components/cards/AgentCard';
import PreBuiltAgents from '../components/cards/PreBuiltAgents';
import PrebuiltAgentList from '../components/cards/PrebuiltAgentList';
import { agentAPI } from '../services/api';

function Explore() {
  const { agents, categories, isLoading } = useAgents();
  const { preBuiltAgents, isLoading: isLoadingPreBuilt } = usePreBuiltAgents();
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filteredItems: filteredAgents
  } = useSearchFilter(agents, ['name', 'description', 'category']);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('agents');
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    skillLevel: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teams
        const teamsResponse = await agentAPI.getTeams();
        setTeams(teamsResponse.data || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleAgentClick = (agent) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    setSelectedAgents(prev => {
      const isSelected = prev.some(a => a.id === agent.id);
      if (isSelected) {
        return prev.filter(a => a.id !== agent.id);
      } else {
        return [...prev, agent];
      }
    });
  };

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => {
    return searchQuery === '' || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <LandingLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          placeholder="Search for agents or teams..."
        />

        {/* Selected Agents Actions */}
        {isAuthenticated && selectedAgents.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setIsCreateTeamModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
              >
                Create Team
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 mt-8">
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'agents'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('agents')}
          >
            <FontAwesomeIcon icon={faRobot} className="mr-2" />
            Agents
          </button>
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'teams'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            <FontAwesomeIcon icon={faUserGroup} className="mr-2" />
            Teams
          </button>
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'tools'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('tools')}
          >
            <FontAwesomeIcon icon={faTools} className="mr-2" />
            Tools
          </button>
        </div>

        {/* Content based on active tab */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div>
                {filteredAgents.length > 0 ? (
                  <AgentList
                    agents={filteredAgents}
                    selectedAgents={selectedAgents}
                    onAgentSelect={handleAgentClick}
                    className="mt-4"
                    layout="grid"
                  />
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                      <FontAwesomeIcon icon={faRobot} className="text-blue-600 dark:text-blue-400 text-2xl" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No agents found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                {isLoadingPreBuilt ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : preBuiltAgents && preBuiltAgents.length > 0 ? (
                  <PreBuiltAgents data={preBuiltAgents} />
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                      <FontAwesomeIcon icon={faUserGroup} className="text-blue-600 dark:text-blue-400 text-2xl" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No teams found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <FontAwesomeIcon icon={faTools} className="text-blue-600 dark:text-blue-400 text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Tools Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400">We're working on adding tools to help enhance your agents</p>
              </div>
            )}
          </div>
        )}

        {/* Create Team Modal */}
        {isCreateTeamModalOpen && (
          <CreateTeam
            agents={selectedAgents}
            onClose={() => {
              setIsCreateTeamModalOpen(false);
              setSelectedAgents([]);
            }}
          />
        )}
      </div>
    </LandingLayout>
  );
}

export default Explore; 