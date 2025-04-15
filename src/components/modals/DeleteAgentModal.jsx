import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { agentV2API } from '../../services/api';
import { toast } from 'react-hot-toast';

const DeleteAgentModal = ({ isOpen, onClose, agent, onDeleted }) => {
  const navigate = useNavigate();
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmName('');
      setIsDeleting(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !agent) return null;

  const isConfirmValid = confirmName === agent.name;

  const handleDelete = async () => {
    if (!isConfirmValid) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await agentV2API.deleteAgent(agent.id);
      toast.success(`"${agent.name}" has been deleted successfully`);
      
      // Close the modal
      onClose();
      
      // Directly navigate to dashboard in addition to calling onDeleted
      // This provides a fallback in case onDeleted doesn't work
      navigate('/dashboard', { replace: true });
      
      // Also call the provided callback
      if (onDeleted && typeof onDeleted === 'function') {
        onDeleted();
      }
      
    } catch (err) {
      console.error('Error deleting agent:', err);
      setError(err.message || 'An error occurred while deleting the agent');
      toast.error('Failed to delete agent');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="delete-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            {/* Modal header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900 dark:text-white" id="delete-modal-title">
                  Delete Agent
                </h3>
              </div>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="mt-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-4">
                  This action <span className="font-medium text-red-600 dark:text-red-400">cannot be undone</span>. 
                  This will permanently delete the agent <span className="font-medium text-gray-700 dark:text-gray-300">"{agent.name}"</span>.
                </p>
                
                {agent.id && (
                  <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-xs font-mono">
                    <div className="text-gray-500 dark:text-gray-400">
                      Agent ID: <span className="text-gray-700 dark:text-gray-300">{agent.id}</span>
                    </div>
                    {agent.type && (
                      <div className="text-gray-500 dark:text-gray-400">
                        Type: <span className="text-gray-700 dark:text-gray-300">{agent.type || (agent.id?.startsWith('SA_') ? 'Super Agent' : 'Tool Agent')}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-6">
                  <label htmlFor="confirm-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To confirm, type <span className="font-semibold">"{agent.name}"</span> below:
                  </label>
                  <input
                    type="text"
                    id="confirm-name"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    className={`block w-full rounded-md shadow-sm ${
                      error
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500'
                    } dark:bg-gray-700 dark:text-white`}
                    placeholder={agent.name}
                    autoComplete="off"
                  />
                </div>
                
                {error && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={!isConfirmValid || isDeleting}
              onClick={handleDelete}
              className={`w-full inline-flex justify-center rounded-md border ${
                isConfirmValid && !isDeleting
                  ? 'border-transparent shadow-sm bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white'
                  : 'border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 cursor-not-allowed opacity-60'
              } px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200`}
            >
              {isDeleting ? (
                <>
                  <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                  Delete Agent
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteAgentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  agent: PropTypes.object,
  onDeleted: PropTypes.func.isRequired
};

export default DeleteAgentModal; 