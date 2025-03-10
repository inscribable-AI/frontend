import React, { useState, useEffect } from 'react';
import AgentCard from '../components/cards/AgentCard';
import { useAgents } from '../hooks/useAgents';
import PageWrapper from '../components/layout/PageWrapper';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CreateTeam } from '../components/CreateTeam';
import { AgentList } from '../components/AgentList';

function Agents() {
  const { agents, categories, isLoading } = useAgents();
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isSelectTeamModalOpen, setIsSelectTeamModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  // Temporary mock data for available teams
  const availableTeams = [
    { id: 'team1', name: 'Team Alpha' },
    { id: 'team2', name: 'Team Beta' },
    { id: 'team3', name: 'Team Gamma' }
  ];

  // Set initial active category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  console.log('Current state:', {
    agents,
    categories,
    activeCategory,
    isLoading
  });

  // Filter agents for current category
  const currentAgents = agents.filter(agent => agent.category === activeCategory);
 
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

  const handleAddToTeam = async (teamId) => {
    try {
      // TODO: Implement add to existing team logic
      // await addAgentsToTeam(teamId, selectedAgents);
      
      toast.success('Agents added to team successfully');
      setIsSelectTeamModalOpen(false);
      setSelectedAgents([]);
      
      // Navigate to team overview page
      navigate(`/dashboard/team/${teamId}`);
    } catch (error) {
      toast.error('Failed to add agents to team');
      console.error('Error adding agents to team:', error);
    }
  };

  const handleCreateTeam = async (teamData) => {
    setIsSubmitting(true);
    try {
      // API call to create team would go here
      console.log('Creating team:', teamData);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-8 bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Agents</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select agents to create or add to a team
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Create Team Button */}
            {selectedAgents.length > 0 && (
              <button
                onClick={() => setIsCreateTeamModalOpen(true)}
                className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg 
                    className="h-5 w-5 text-gray-400 group-hover:text-indigo-500/70 dark:text-gray-500 dark:group-hover:text-indigo-400/70 transition-colors duration-200 ease-in-out" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
                <span className="pl-8 group-hover:text-indigo-600/70 dark:group-hover:text-indigo-400/70">
                  Create Team ({selectedAgents.length})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeCategory === category
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Section */}
        <section>
          <AgentList
            agents={currentAgents}
            selectedAgents={selectedAgents}
            onAgentSelect={handleAgentSelect}
            layout={viewMode}
            className="mt-6"
          />
        </section>

        {/* Create Team Modal */}
        {isCreateTeamModalOpen && (
          <CreateTeam
            agents={selectedAgents}
            onClose={() => setIsCreateTeamModalOpen(false)}
            onCreateTeam={handleCreateTeam}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Select Team Modal */}
        <Dialog
          open={isSelectTeamModalOpen}
          onClose={() => setIsSelectTeamModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Team
              </Dialog.Title>

              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose a team to add {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} to:
                </p>

                <div className="space-y-2">
                  {availableTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleAddToTeam(team.id)}
                      className="w-full p-4 text-left rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {team.name}
                      </h3>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsSelectTeamModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </PageWrapper>
  );
}

export default Agents; 