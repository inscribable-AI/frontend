import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import PropTypes from 'prop-types';
import { ChevronRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { agentAPI } from '../../services/api';

const PreBuiltAgents = ({ data }) => {
  console.log("data", data);
  
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleUseTeam = () => {
    setTeamName(selectedTeam.name); // Set default name
    setIsNamePromptOpen(true);
  };

  const handleCreateTeam = async () => {
    try {
      setIsCreating(true);
      
      // Format the team data according to the API structure
      const teamData = {
        teams: [{
          id: selectedTeam.category,
          name: selectedTeam.name,
          description: `Pre-built ${selectedTeam.category} team`,
          image: "", // You might want to add image handling
          agentIds: selectedTeam.members.map(member => member.id)
        }],
        name: teamName,
        provision: 2 // 2 for prebuilt as specified in the API
      };

      // Make the API request to create the team
      const response = await agentAPI.recruitNewAgents(teamData);
      
      // Close modals
      setIsNamePromptOpen(false);
      setIsModalOpen(false);
      setTeamName('');
      
      // Navigate to the new team's overview page using the returned ID
      navigate(`/dashboard/team/${response.data.teamId}`);
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((team) => (
        <div 
          key={team.name}
          onClick={() => handleTeamClick(team)}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        >
          {/* Team Card Header - Image/Banner */}
          <div className="relative h-40 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
            <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 rounded-full flex items-center space-x-1">
              <UserGroupIcon className="h-4 w-4 text-white" />
              <span className="text-sm text-white">{team.members.length} Members</span>
            </div>
          </div>

          {/* Team Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {team.name}
            </h3>
            
            {/* Team Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="relative h-8 w-8">
                    <svg viewBox="0 0 36 36" className="h-8 w-8 transform -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                        className="dark:stroke-gray-600"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="3"
                        strokeDasharray={`${(team.members.length / 5) * 100}, 100`}
                        className="dark:stroke-indigo-400"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Coverage</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{Math.min(100, (team.members.length / 5) * 100)}%</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="relative h-8 w-8">
                    <svg viewBox="0 0 36 36" className="h-8 w-8 transform -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                        className="dark:stroke-gray-600"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="3"
                        strokeDasharray={`${(team.members.filter(m => m.tools.length > 0).length / team.members.length) * 100}, 100`}
                        className="dark:stroke-indigo-400"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Tools Ready</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((team.members.filter(m => m.tools.length > 0).length / team.members.length) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category and Action */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {team.category}
                </span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      ))}

      {/* Team Details Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-h-[90vh] overflow-y-auto mx-auto max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            {selectedTeam && (
              <div className="flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <Dialog.Title className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                        {selectedTeam.name}
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {selectedTeam.category} • {selectedTeam.members.length} Members
                      </p>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto">
                  {selectedTeam.members.map((member) => (
                    <div 
                      key={member.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {member.name}
                      </h4>
                      
                      {/* Member Classifications */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        {member.classification.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Member Tools */}
                      {member.tools.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tools ({member.tools.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {member.tools.map((tool, index) => (
                              <div 
                                key={index}
                                className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-600/50 rounded p-2"
                              >
                                <span className="font-medium">{tool.name}</span>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">
                                  {tool.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Actions - Sticky */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleUseTeam}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Use This Team
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Name Prompt Modal */}
      <Dialog
        open={isNamePromptOpen}
        onClose={() => setIsNamePromptOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Name Your Team
            </Dialog.Title>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choose a name for your new team. This will help you identify it on your dashboard.
            </p>

            <div className="mb-6">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsNamePromptOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={!teamName.trim() || isCreating}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

PreBuiltAgents.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      classification: PropTypes.arrayOf(PropTypes.string).isRequired,
      tools: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        credentials: PropTypes.any
      })).isRequired
    })).isRequired
  })).isRequired
};

export default PreBuiltAgents; 