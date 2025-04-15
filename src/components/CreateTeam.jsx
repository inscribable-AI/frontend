import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { agentAPI, userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faChevronDown, faPlus, faCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import CredentialModal from './modals/CredentialModal';

export function CreateTeam({ agents, onClose, isSubmitting: externalIsSubmitting }) {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(null);
  const [userCredentials, setUserCredentials] = useState([]);
  const [selectedCredentials, setSelectedCredentials] = useState({});
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [currentCredentialKey, setCurrentCredentialKey] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [showSecret, setShowSecret] = useState({});
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);

  const selectedAgent = selectedAgentIndex !== null ? agents[selectedAgentIndex] : null;
  
  useEffect(() => {
    const fetchCredentials = async () => {
      setIsLoadingCredentials(true);
      try {
        const response = await userAPI.getUserCredentials();
        setUserCredentials(response.data || []);
      } catch (error) {
        console.error('Error fetching credentials:', error);
      } finally {
        setIsLoadingCredentials(false);
      }
    };
    
    fetchCredentials();
  }, []);

  const getCredentialsByKey = () => {
    const grouped = {};
    
    userCredentials.forEach(cred => {
      if (!grouped[cred.key]) {
        grouped[cred.key] = [];
      }
      grouped[cred.key].push(cred);
    });
    
    return grouped;
  };
  
  const credentialsByKey = getCredentialsByKey();
  
  const getRequiredCredentials = () => {
    const allCredentials = {};
    
    if (selectedAgent && selectedAgent.requiredCredentials) {
      return selectedAgent.requiredCredentials;
    }
    
    agents.forEach(agent => {
      if (agent.requiredCredentials) {
        Object.entries(agent.requiredCredentials).forEach(([key, description]) => {
          allCredentials[key] = description;
        });
      }
    });
    
    return allCredentials;
  };
  
  const requiredCredentials = getRequiredCredentials();
  
  const hasSelectedCredential = (key) => {
    return !!selectedCredentials[key];
  };
  
  const getMissingCredentials = () => {
    return Object.keys(requiredCredentials).filter(key => !hasSelectedCredential(key));
  };
  
  const missingCredentials = getMissingCredentials();
  
  const toggleDropdown = (key) => {
    setDropdownOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const toggleShowSecret = (key) => {
    setShowSecret(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const selectCredential = (key, credential) => {
    setSelectedCredentials(prev => ({
      ...prev,
      [key]: credential
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [key]: false
    }));
  };
  
  const handleAddNewCredential = (key, description) => {
    setCurrentCredentialKey({
      key: key,
      name: description
    });
    setCredentialModalOpen(true);
  };
  
  const handleCredentialSave = async (credentialData) => {
    try {
      const response = await userAPI.storeUserCredential(credentialData);
      const updatedResponse = await userAPI.getUserCredentials();
      setUserCredentials(updatedResponse.data || []);
      
      setSelectedCredentials(prev => ({
        ...prev,
        [credentialData.key]: response.data
      }));
      
      toast.success('Credential added successfully');
    } catch (error) {
      console.error('Error saving credential:', error);
      toast.error('Failed to save credential');
    }
    
    setCredentialModalOpen(false);
  };

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
          image: "",
          agentIds: agents.map(agent => agent.id),
          credentials: selectedCredentials
        }],
        name: teamName,
        provision: 1
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

  const handleAgentClick = (index) => {
    setSelectedAgentIndex(index);
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
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
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter team description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Agents ({agents.length})
              </label>
              
              <div className="mb-3 flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-primary-500" />
                Click on an agent to manage its required credentials
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {agents.map((agent, index) => (
                  <div 
                    key={agent.id} 
                    className={`flex flex-col items-center p-2 rounded-lg cursor-pointer border transition-all duration-200 ${
                      selectedAgentIndex === index 
                        ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-50 dark:bg-primary-900/20 shadow-md' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                    onClick={() => handleAgentClick(index)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2 relative">
                      {agent.image ? (
                        <img src={agent.image} alt={agent.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                          {agent.name.charAt(0)}
                        </span>
                      )}
                      
                      {agent.requiredCredentials && Object.keys(agent.requiredCredentials).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {Object.keys(agent.requiredCredentials).length}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-xs font-medium text-gray-900 dark:text-white text-center truncate w-full">
                      {agent.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(requiredCredentials).length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedAgent 
                      ? `Required Credentials for ${selectedAgent.name}` 
                      : 'Required Credentials for All Agents'}
                  </h3>
                  
                  {selectedAgentIndex !== null && (
                    <button 
                      type="button"
                      onClick={() => setSelectedAgentIndex(null)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Show all credentials
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {isLoadingCredentials ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <>
                      {Object.entries(requiredCredentials).map(([key, description]) => {
                        const matchingCredentials = credentialsByKey[key] || [];
                        const hasMultipleOptions = matchingCredentials.length > 0;
                        const isSelected = hasSelectedCredential(key);
                        const selectedCred = selectedCredentials[key];
                        
                        return (
                          <div key={key} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                              <div>
                                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{key}</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                              </div>
                              
                              {isSelected ? (
                                <span className="flex items-center text-green-600 dark:text-green-400 text-xs">
                                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                  Selected
                                </span>
                              ) : null}
                            </div>
                            
                            <div className="credential-dropdown">
                              {hasMultipleOptions ? (
                                <div className="relative">
                                  {isSelected ? (
                                    <div 
                                      className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 cursor-pointer"
                                      onClick={() => toggleDropdown(key)}
                                    >
                                      <div className="flex-1 truncate pr-2">
                                        <span className="font-medium text-gray-800 dark:text-gray-200 mr-1">{selectedCred.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                          {showSecret[key] ? selectedCred.value : '•••••••••••••'}
                                        </span>
                                      </div>
                                      <div className="flex-shrink-0 flex items-center">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleShowSecret(key);
                                          }}
                                          className="mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                          <FontAwesomeIcon icon={showSecret[key] ? faEyeSlash : faEye} />
                                        </button>
                                        <FontAwesomeIcon icon={faChevronDown} />
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => toggleDropdown(key)}
                                      className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                    >
                                      <span>Select a credential</span>
                                      <FontAwesomeIcon icon={faChevronDown} />
                                    </button>
                                  )}
                                  
                                  {dropdownOpen[key] && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                      <ul>
                                        {matchingCredentials.map(cred => (
                                          <li 
                                            key={cred.id}
                                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm border-b border-gray-200 dark:border-gray-600 last:border-0"
                                            onClick={() => selectCredential(key, cred)}
                                          >
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{cred.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                              {showSecret[key] ? cred.value : '•••••••••••••'}
                                            </div>
                                          </li>
                                        ))}
                                        <li className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm border-t border-gray-200 dark:border-gray-600">
                                          <button
                                            type="button"
                                            className="w-full text-left flex items-center text-primary-600 dark:text-primary-400"
                                            onClick={() => handleAddNewCredential(key, description)}
                                          >
                                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                            Add new credential
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddNewCredential(key, description)}
                                  className="w-full px-3 py-2 text-sm bg-primary-100 text-black dark:bg-primary-900/30 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors flex items-center justify-center"
                                >
                                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                  Add new credential
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {missingCredentials.length > 0 && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          Missing {missingCredentials.length} required credential(s)
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || missingCredentials.length > 0}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {credentialModalOpen && (
            <CredentialModal
              credential={currentCredentialKey}
              isOpen={credentialModalOpen}
              onClose={() => setCredentialModalOpen(false)}
              onSave={handleCredentialSave}
              isEditMode={false}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 