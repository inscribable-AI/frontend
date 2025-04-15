import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faTimes, faTools, faUser, faKey, 
  faWandMagicSparkles, faCheck, faCode
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { agentV2API } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AgentPreviewModal = ({ 
  isOpen, 
  onClose, 
  agentName, 
  agentDescription, 
  selectedTools, 
  selectedCredentials,
  characterTraits, 
  generatedPrompt 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Sections to display in the preview
  const sections = [
    { 
      key: 'details', 
      icon: faRobot, 
      title: 'Agent Details',
      hasBorder: true 
    },
    { 
      key: 'tools', 
      icon: faTools, 
      title: 'Selected Tools', 
      count: selectedTools.length,
      hasBorder: true
    }
  ];

  // Only add credentials section if there are credentials
  if (Object.keys(selectedCredentials).length > 0) {
    sections.push({ 
      key: 'credentials', 
      icon: faKey, 
      title: 'Selected Credentials', 
      count: Object.keys(selectedCredentials).length,
      hasBorder: true
    });
  }

  // Add character traits section if there are any defined
  const hasCharacterTraits = Object.values(characterTraits || {}).some(value => !!value);
  if (hasCharacterTraits) {
    sections.push({ 
      key: 'character', 
      icon: faUser, 
      title: 'Character Traits', 
      hasBorder: true
    });
  }

  // Add prompt section if there is a generated prompt
  if (generatedPrompt) {
    sections.push({ 
      key: 'prompt', 
      icon: faWandMagicSparkles, 
      title: 'Generated Prompt',
      hasBorder: false 
    });
  }

    console.log('Starting agent creation...');
    console.log('Agent name:', agentName);
    console.log('Agent description:', agentDescription);
    console.log('Selected tools:', selectedTools);
    console.log('Selected credentials:', selectedCredentials);
    console.log('Character traits:', characterTraits);
    console.log('Has character traits:', hasCharacterTraits);
    console.log('Generated prompt exists:', !!generatedPrompt);

  const handleCreateAgent = async () => {
    setIsCreating(true);
    try {
      // Format data according to the API documentation
      const agentData = {
        name: agentName,
        description: agentDescription,
        tools: selectedTools.map(tool => {
          // Find the credential for this tool if it exists
          const toolCredential = tool.credentials ? Object.keys(tool.credentials).reduce((acc, key) => {
            // If this credential key exists in the selectedCredentials, include it
            if (selectedCredentials[key]) {
              acc[key] = selectedCredentials[key].id;
            }
            return acc;
          }, {}) : {};
          
          return {
            id: tool.id,
            name: tool.name,
            description: tool.description,
            // Add the credentialId property if the tool has credentials
            ...(Object.keys(toolCredential).length > 0 && { credentialId: toolCredential })
          };
        }),
        // Only include character if it has values
        ...(hasCharacterTraits && { character: characterTraits }),
        // Only include prompt if it exists
        ...(generatedPrompt && { prompt: generatedPrompt }),
        provisionType: 1
      };
      
      // Use agentV2API.createAgent as documented in the API
      const response = await agentV2API.createAgent(agentData);
      
      if (response.success || response.data) {
        toast.success('Agent created successfully!');
        
        // Get the agent ID from the response
        const agentId = response.data?.id || response.data?.agentId || response.id;
        
        // Close the modal
        onClose(true);
        
        // Navigate to the agent details page if we have an agent ID
        if (agentId) {
          navigate(`/dashboard/agent/${agentId}`);
        } else {
          console.warn('Agent created but no ID returned. Cannot navigate to details page.');
        }
      } else {
        toast.error('Something went wrong creating your agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error(error.response?.data?.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Modal header */}
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-2 text-primary-600 dark:text-primary-400" />
                Agent Preview
              </h3>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {/* Preview content */}
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Review your agent details below. When you're ready, click "Create Agent" to finalize.
                  </span>
                </p>
              </div>
              
              {/* Agent details */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {sections.map((section, index) => (
                  <div key={section.key} className={`${index > 0 && section.hasBorder ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <FontAwesomeIcon icon={section.icon} className="mr-2 text-primary-600 dark:text-primary-400" />
                        {section.title}
                        {section.count !== undefined && <span className="ml-1">({section.count})</span>}
                      </h4>
                    </div>
                    
                    <div className="px-4 py-3 bg-white dark:bg-gray-800">
                      {section.key === 'details' && (
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Name</h5>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">{agentName}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</h5>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">{agentDescription}</p>
                          </div>
                        </div>
                      )}
                      
                      {section.key === 'tools' && (
                        <div className="space-y-2">
                          {selectedTools.map(tool => (
                            <div key={tool.id} className="flex items-center text-sm">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                              <span className="font-medium text-gray-900 dark:text-white">{tool.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({tool.category})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.key === 'credentials' && (
                        <div className="space-y-2">
                          {Object.entries(selectedCredentials).map(([key, credential]) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faCheck} className="mr-2 text-green-500" />
                                <span className="font-mono text-gray-700 dark:text-gray-300">{key}</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{credential.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.key === 'character' && (
                        <div className="space-y-2">
                          {Object.entries(characterTraits).map(([key, value]) => 
                            value ? (
                              <div key={key} className="text-sm">
                                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h5>
                                <p className="text-gray-900 dark:text-white mt-1">{value}</p>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                      
                      {section.key === 'prompt' && (
                        <div className="relative">
                          <div className="absolute top-0 right-0 p-2">
                            <FontAwesomeIcon icon={faCode} className="text-gray-400" />
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600">
                            <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200">
                              {generatedPrompt}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto"
                disabled={isCreating}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreateAgent}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Creating Agent...
                  </>
                ) : (
                  'Create Agent'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AgentPreviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  agentName: PropTypes.string.isRequired,
  agentDescription: PropTypes.string.isRequired,
  selectedTools: PropTypes.array.isRequired,
  selectedCredentials: PropTypes.object.isRequired,
  characterTraits: PropTypes.object,
  generatedPrompt: PropTypes.string
};

export default AgentPreviewModal; 