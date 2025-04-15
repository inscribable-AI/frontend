import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faTools, faKey, faPlus, faTimes, faCheck, faChevronDown, faEye, faEyeSlash, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { userAPI } from '../../services/api';
import CredentialModal from './CredentialModal';
import CharacterTraitsModal from './CharacterTraitsModal';

const CreateAgentModal = ({ isOpen, onClose, selectedTools }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [userCredentials, setUserCredentials] = useState([]);
  const [selectedCredentials, setSelectedCredentials] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [currentCredentialKey, setCurrentCredentialKey] = useState(null);
  const [currentRequiredSecretKeys, setCurrentRequiredSecretKeys] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [showSecret, setShowSecret] = useState({});
  const [characterModalOpen, setCharacterModalOpen] = useState(false);

  // Fetch user credentials
  useEffect(() => {
    const fetchCredentials = async () => {
      setIsLoading(true);
      try {
        const response = await userAPI.getUserCredentials();
        setUserCredentials(response.data || []);
      } catch (error) {
        console.error('Error fetching credentials:', error);
        toast.error('Failed to load credentials');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCredentials();
    }
  }, [isOpen]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Get all required credentials from selected tools
  const getRequiredCredentials = () => {
    const allCredentials = {};
    
    selectedTools.forEach(tool => {
      if (tool.credentials) {
        Object.entries(tool.credentials).forEach(([key, value]) => {
          allCredentials[key] = value;
        });
      }
    });
    
    return allCredentials;
  };

  // Group credentials by key
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
  const requiredCredentials = getRequiredCredentials();

  // Check if a required credential key has a selected value
  const hasSelectedCredential = (key) => {
    return !!selectedCredentials[key];
  };

  // Get missing credentials
  const getMissingCredentials = () => {
    return Object.keys(requiredCredentials).filter(key => !hasSelectedCredential(key));
  };

  const missingCredentials = getMissingCredentials();

  // Select a credential for a key
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

  // Toggle dropdown for a credential key
  const toggleDropdown = (key) => {
    setDropdownOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle showing secret value
  const toggleShowSecret = (key) => {
    setShowSecret(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Open credential modal for adding a new credential
  const handleAddNewCredential = (key, description) => {
    // Parse the credential format from tools metadata
    // Example: "BITCOIN_PASSPHRASE: string, \n BITCOIN_ACCOUNT_INDEX: number"
    let secretKeyInfo = [];
    
    if (description && typeof description === 'string') {
      // Split by commas and newlines to get individual key-type pairs
      const keyTypePairs = description.split(/,|\n/).map(item => item.trim()).filter(Boolean);
      
      // Parse each pair into key and type
      secretKeyInfo = keyTypePairs.map(pair => {
        const [keyWithColon, type] = pair.split(':').map(part => part.trim());
        const secretKey = keyWithColon.replace(':', ''); // Remove any remaining colon
        
        return {
          key: secretKey,
          type: type || 'string',
          required: true,
          description: `${secretKey} (${type || 'string'})`
        };
      });
    }
    
    // If we couldn't parse anything or the format was unexpected, use defaults
    if (secretKeyInfo.length === 0) {
      secretKeyInfo = [
        { key: 'value', type: 'string', required: true, description: 'The credential value' }
      ];
    }
    
    setCurrentCredentialKey({
      key: key,
      name: `${key} Credential` // More descriptive name
    });
    setCurrentRequiredSecretKeys(secretKeyInfo);
    setCredentialModalOpen(true);
  };

  // Handle saving a new credential
  const handleCredentialSave = async (credentialData) => {
    try {
      // Store the credential
      await userAPI.storeUserCredential(credentialData);
      
      // Refresh credentials list
      const updatedResponse = await userAPI.getUserCredentials();
      setUserCredentials(updatedResponse.data || []);
      
      // Auto-select the newly created credential
      const newCredential = updatedResponse.data.find(c => c.key === credentialData.key);
      if (newCredential) {
        selectCredential(credentialData.key, newCredential);
      }
      
      setCredentialModalOpen(false);
      toast.success('Credential added successfully');
    } catch (error) {
      console.error('Error saving credential:', error);
      toast.error('Failed to add credential');
    }
  };

  // Validate form before submission
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (missingCredentials.length > 0) {
      newErrors.credentials = `Missing ${missingCredentials.length} required credential(s)`
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      // If all required fields are valid, open the character modal
      setCharacterModalOpen(true);
    }
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('.credential-dropdown');
      let clickedInside = false;
      
      dropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
          clickedInside = true;
        }
      });
      
      if (!clickedInside && Object.values(dropdownOpen).some(isOpen => isOpen)) {
        setDropdownOpen({});
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Modal header */}
              <div className="flex justify-between items-start mb-5">
                <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white flex items-center">
                  <FontAwesomeIcon icon={faRobot} className="mr-2 text-primary-600 dark:text-primary-400" />
                  Create New Agent
                </h3>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={onClose}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              {/* Agent details form */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Agent Details
                </h3>
                
                <div className="space-y-4">
                  {/* Name input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.name
                          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500'
                      } dark:bg-gray-700 dark:text-white`}
                      placeholder="e.g., Research Assistant"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* Description input */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.description
                          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500'
                      } dark:bg-gray-700 dark:text-white`}
                      placeholder="Describe what this agent will do..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Selected tools section */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <FontAwesomeIcon icon={faTools} className="mr-2 text-primary-600 dark:text-primary-400" />
                  Selected Tools ({selectedTools.length})
                </h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
                  {selectedTools.map(tool => (
                    <div key={tool.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{tool.name}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({tool.category})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Required credentials section */}
              {Object.keys(requiredCredentials).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <FontAwesomeIcon icon={faKey} className="mr-2 text-primary-600 dark:text-primary-400" />
                    Required Credentials
                    {missingCredentials.length > 0 && (
                      <span className="ml-2 text-xs font-normal bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                        {missingCredentials.length} missing
                      </span>
                    )}
                  </h3>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 pb-1">
                      {Object.entries(requiredCredentials).map(([key, description]) => {
                        const matchingCredentials = credentialsByKey[key] || [];
                        const hasMultipleOptions = matchingCredentials.length > 0;
                        const isSelected = hasSelectedCredential(key);
                        const selectedCred = selectedCredentials[key];
                        
                        return (
                          <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-md">
                            <div className="flex flex-col mb-3">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="font-mono text-xs sm:text-sm break-all bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300 max-w-full">
                                  {key}
                                </div>
                                
                                {isSelected && (
                                  <span className="flex items-center text-green-600 dark:text-green-400 text-xs bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                    <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-words">
                                {description}
                              </p>
                            </div>
                            
                            {/* Credential dropdown container */}
                            <div className="credential-dropdown relative">
                              {hasMultipleOptions ? (
                                <div className="w-full">
                                  <div className="relative">
                                    {isSelected ? (
                                      <div 
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => toggleDropdown(key)}
                                      >
                                        <div className="flex-1 min-w-0 mr-2">
                                          <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{selectedCred.name}</div>
                                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <div className="truncate max-w-full">
                                              {showSecret[key] ? 
                                                (() => {
                                                  try {
                                                    const secretObj = JSON.parse(selectedCred.secret);
                                                    const keyCount = Object.keys(secretObj).length;
                                                    return keyCount > 1 
                                                      ? `${keyCount} secret value${keyCount > 1 ? 's' : ''}` 
                                                      : selectedCred.secret.substring(0, 30) + (selectedCred.secret.length > 30 ? '...' : '');
                                                  } catch(e) {
                                                    return selectedCred.secret.substring(0, 30) + (selectedCred.secret.length > 30 ? '...' : '');
                                                  }
                                                })() : 
                                                '•••••••••••••'
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleShowSecret(key);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-full transition-colors mr-1"
                                            aria-label={showSecret[key] ? "Hide secret" : "Show secret"}
                                          >
                                            <FontAwesomeIcon icon={showSecret[key] ? faEyeSlash : faEye} size="sm" />
                                          </button>
                                          <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => toggleDropdown(key)}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <span className="text-gray-500 dark:text-gray-400">Select a credential</span>
                                        <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                                      </button>
                                    )}
                                    
                                    {/* Dropdown options */}
                                    {dropdownOpen[key] && (
                                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-[40vh] md:max-h-60 overflow-y-auto">
                                        <ul className="py-1">
                                          {matchingCredentials.length > 0 ? (
                                            <>
                                              <div className="px-3 py-2 sticky top-0 bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-700 z-10">
                                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saved Credentials</h4>
                                              </div>
                                              <div className="overflow-y-auto max-h-[calc(40vh-3rem)] md:max-h-[calc(60vh-8rem)]">
                                                {matchingCredentials.map(cred => (
                                                  <li 
                                                    key={cred.id}
                                                    className="hover:bg-gray-100 dark:hover:bg-gray-600 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                  >
                                                    <button 
                                                      type="button"
                                                      className="w-full text-left px-3 py-2 flex flex-col"
                                                      onClick={() => selectCredential(key, cred)}
                                                    >
                                                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{cred.name}</div>
                                                      <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1">
                                                        <span className="truncate flex-1 max-w-full">
                                                          {showSecret[key] ? 
                                                            (() => {
                                                              try {
                                                                const secretObj = JSON.parse(cred.secret);
                                                                const keyCount = Object.keys(secretObj).length;
                                                                return keyCount > 1 
                                                                  ? `${keyCount} secret value${keyCount > 1 ? 's' : ''}` 
                                                                  : cred.secret.substring(0, 30) + (cred.secret.length > 30 ? '...' : '');
                                                              } catch(e) {
                                                                return cred.secret.substring(0, 30) + (cred.secret.length > 30 ? '...' : '');
                                                              }
                                                            })() 
                                                            : '•••••••••••••'
                                                          }
                                                        </span>
                                                        {cred.createdAt && (
                                                          <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                            {new Date(cred.createdAt).toLocaleDateString(undefined, {
                                                              year: '2-digit',
                                                              month: 'short',
                                                              day: 'numeric'
                                                            })}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </button>
                                                  </li>
                                                ))}
                                              </div>
                                            </>
                                          ) : (
                                            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                                              No saved credentials found
                                            </li>
                                          )}
                                          
                                          <li className="border-t border-gray-200 dark:border-gray-600 sticky bottom-0 bg-white dark:bg-gray-700">
                                            <button
                                              type="button"
                                              className="w-full px-3 py-2 text-left flex items-center text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                              onClick={() => handleAddNewCredential(key, description)}
                                            >
                                              <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                              <span className="font-medium">Add new credential</span>
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddNewCredential(key, description)}
                                  className="w-full px-3 py-2 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors flex items-center justify-center"
                                >
                                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                  Add new credential
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center"
                  disabled={isSubmitting || missingCredentials.length > 0}
                >
                  {isSubmitting ? 'Loading...' : (
                    <>
                      Continue
                      <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Credential Modal */}
      {credentialModalOpen && (
        <CredentialModal
          credential={currentCredentialKey}
          isOpen={credentialModalOpen}
          onClose={() => setCredentialModalOpen(false)}
          onSave={handleCredentialSave}
          isEditMode={false}
          requiredSecretKeys={currentRequiredSecretKeys}
        />
      )}
      
      {/* Add Character Traits Modal */}
      {characterModalOpen && (
        <CharacterTraitsModal
          isOpen={characterModalOpen}
          onClose={() => setCharacterModalOpen(false)}
          agentName={formData.name}
          agentDescription={formData.description}
          selectedTools={selectedTools}
          selectedCredentials={selectedCredentials}
        />
      )}
    </div>
  );
};

CreateAgentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedTools: PropTypes.array.isRequired
};

export default CreateAgentModal; 