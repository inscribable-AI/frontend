import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { agentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function CreateTeam({ agents, onClose, isSubmitting: externalIsSubmitting }) {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const teamData = {
        teams: [{
          id: `team-${Date.now()}`,
          name: teamName,
          description: teamDescription || `Custom team with ${agents.length} agent${agents.length > 1 ? 's' : ''}`,
          image: "", // Optional image field
          agentIds: agents.map(agent => agent.id)
        }],
        name: teamName,
        provision: 1 // 1 for custom teams (unlike 2 for prebuilt)
      };

      const response = await agentAPI.recruitNewAgents(teamData);
      
      toast.success('Team created successfully');
      onClose();
      navigate(`/dashboard/team/${response.data.teamId}`);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
              Create New Team
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter team name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter team description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Agents ({agents.length})
              </label>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="text-sm text-gray-900 dark:text-white">{agent.name}</span>
                    </div>
                    {agent.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.category.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Team'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 