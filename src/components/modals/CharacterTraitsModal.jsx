import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faTimes, faChevronRight, faWandMagicSparkles, 
  faFont, faVoicemail, faBolt, faAddressCard, faBook, faHistory, faPerson, faForward
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { agentV2API } from '../../services/api';
import AgentPreviewModal from './AgentPreviewModal';

const CharacterTraitsModal = ({ isOpen, onClose, agentName, agentDescription, selectedTools, selectedCredentials = {} }) => {
  // Character state
  const [character, setCharacter] = useState({
    name: '',
    biography: '',
    backstory: '',
    pronouns: '',
    temperament: '',
    toneOfVoice: '',
    responseStyle: '',
    personality: ''
  });
  
  // UI states
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate prompt based on character traits and navigate to preview
  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      // Format data according to the API documentation
      const promptData = {
        name: agentName,
        description: agentDescription,
        tools: selectedTools.map(tool => ({name: tool.name, description: tool.description})),
        character: character
      };
      
      // Call the createAgentPrompt method as documented
      const response = await agentV2API.createAgentPrompt(promptData);
      
      // Handle response according to its structure
      let promptText = '';
      if (response.data) {
        promptText = response.data;
      } else if (typeof response === 'string') {
        // Handle case where the API might return the prompt directly as a string
        promptText = response;
      }
      
      if (!promptText) {
        throw new Error('No prompt was returned from the server');
      }
      
      setGeneratedPrompt(promptText);
      toast.success('Prompt generated successfully!');
      
      // Automatically open the preview modal after generating the prompt
      setPreviewModalOpen(true);
    } catch (error) {
      console.error('Error generating prompt:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate prompt';
      toast.error(errorMessage);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Open preview modal
  const openPreview = () => {
    setPreviewModalOpen(true);
  };

  // Handle skip to preview without generating prompt
  const handleSkip = () => {
    // When skipping, we still want to preserve any character traits the user may have entered
    // but we don't generate a custom prompt
    setGeneratedPrompt(''); // Clear any previously generated prompt
    setPreviewModalOpen(true);
  };

  // Handle preview modal close
  const handlePreviewClose = (success) => {
    setPreviewModalOpen(false);
    if (success) {
      onClose();
    }
  };

  // Character trait definitions with labels and placeholders
  const characterTraits = [
    {
      key: 'name',
      label: 'Character Name',
      placeholder: 'Leave blank to use agent name',
      type: 'input',
      rows: 1,
      icon: faFont,
      description: 'A specific name for your agent character.'
    },
    {
      key: 'pronouns',
      label: 'Pronouns',
      placeholder: 'e.g., they/them, she/her, he/him',
      type: 'input',
      rows: 1,
      icon: faPerson,
      description: 'How your agent should refer to itself.'
    },
    {
      key: 'toneOfVoice',
      label: 'Tone of Voice',
      placeholder: 'e.g., professional, friendly, casual, formal',
      type: 'input',
      rows: 1,
      icon: faVoicemail,
      description: 'The general tone your agent should use in responses.'
    },
    {
      key: 'responseStyle',
      label: 'Response Style',
      placeholder: 'e.g., concise, detailed, step-by-step',
      type: 'input',
      rows: 1,
      icon: faBolt,
      description: 'How your agent should structure its responses.'
    },
    {
      key: 'temperament',
      label: 'Temperament',
      placeholder: 'e.g., patient, excitable, calm, analytical',
      type: 'input',
      rows: 1,
      icon: faAddressCard,
      description: 'The general disposition and attitude of your agent.'
    },
    {
      key: 'personality',
      label: 'Personality',
      placeholder: 'Additional personality traits...',
      type: 'textarea',
      rows: 2,
      icon: faUser,
      description: 'Specific personality characteristics and behavior patterns.'
    },
    {
      key: 'biography',
      label: 'Biography',
      placeholder: 'A brief biography of your agent...',
      type: 'textarea',
      rows: 2,
      icon: faBook,
      description: 'Background information about your agent.'
    },
    {
      key: 'backstory',
      label: 'Backstory',
      placeholder: 'Additional background information...',
      type: 'textarea',
      rows: 2,
      icon: faHistory,
      description: 'Detailed history or origin story for your agent.'
    }
  ];

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
                <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600 dark:text-primary-400" />
                Define Agent Character
              </h3>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {/* Progress indicator */}
            <div className="mb-4">
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full">
                <div className={`h-1 bg-primary-500 rounded-full ${generatedPrompt ? 'w-full' : 'w-1/2'}`}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {generatedPrompt 
                  ? 'Character details saved. Review your agent configuration.' 
                  : 'Customize your agent personality traits (optional).'}
              </p>
            </div>
            
            {/* Info box */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong>Optional:</strong> Define character traits to customize your agent's personality, or skip this step to create a standard agent.
                </span>
              </p>
            </div>
            
            {/* Character traits form */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Character Traits
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Define how your agent should behave and respond. These traits will be used to generate a custom prompt.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characterTraits.map((trait) => (
                  <div 
                    key={trait.key} 
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 transition-colors"
                  >
                    <div className="flex items-start mb-2">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                        <FontAwesomeIcon 
                          icon={trait.icon} 
                          className="text-primary-600 dark:text-primary-400" 
                        />
                      </div>
                      <div>
                        <label 
                          htmlFor={trait.key} 
                          className="block text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {trait.label}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {trait.description}
                        </p>
                      </div>
                    </div>
                    
                    {trait.type === 'input' ? (
                      <input
                        type="text"
                        id={trait.key}
                        name={trait.key}
                        value={character[trait.key]}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-0 dark:bg-gray-600 dark:text-white"
                        placeholder={trait.placeholder}
                      />
                    ) : (
                      <textarea
                        id={trait.key}
                        name={trait.key}
                        rows={trait.rows}
                        value={character[trait.key]}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-0 dark:bg-gray-600 dark:text-white"
                        placeholder={trait.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Generated Prompt Section */}
            {generatedPrompt && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2 text-purple-500" />
                  Generated Prompt
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                    {generatedPrompt}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto"
                disabled={isGeneratingPrompt}
              >
                Cancel
              </button>
              
              {!generatedPrompt ? (
                <>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto flex items-center justify-center"
                    disabled={isGeneratingPrompt}
                  >
                    Skip
                    <FontAwesomeIcon icon={faForward} className="ml-1" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleGeneratePrompt}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center"
                    disabled={isGeneratingPrompt}
                  >
                    {isGeneratingPrompt ? (
                      <>
                        <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        Next
                        <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openPreview}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  Continue to Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview Modal */}
      {previewModalOpen && (
        <AgentPreviewModal
          isOpen={previewModalOpen}
          onClose={handlePreviewClose}
          agentName={agentName}
          agentDescription={agentDescription}
          selectedTools={selectedTools}
          selectedCredentials={selectedCredentials}
          characterTraits={character}
          generatedPrompt={generatedPrompt}
        />
      )}
    </div>
  );
};

CharacterTraitsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  agentName: PropTypes.string.isRequired,
  agentDescription: PropTypes.string.isRequired,
  selectedTools: PropTypes.array.isRequired,
  selectedCredentials: PropTypes.object
};

export default CharacterTraitsModal; 