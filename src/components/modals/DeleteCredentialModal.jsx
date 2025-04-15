import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faTrash, faKey } from '@fortawesome/free-solid-svg-icons';
import { userAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const DeleteCredentialModal = ({ isOpen, onClose, credential, onDeleted, onRefreshCredentials }) => {
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

  if (!isOpen || !credential) return null;

  const isConfirmValid = confirmName === credential.name;

  const handleDelete = async () => {
    if (!isConfirmValid) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await userAPI.deleteUserCredential({
        key: credential.key,
        name: credential.name
      });
      
      toast.success(`"${credential.name}" has been deleted successfully`);
      
      // Close the modal
      onClose();
      
      // Call the onDeleted callback for immediate UI update
      if (onDeleted && typeof onDeleted === 'function') {
        onDeleted(credential.key);
      }
      
      // Also refresh credentials if provided
      if (onRefreshCredentials && typeof onRefreshCredentials === 'function') {
        setTimeout(() => {
          onRefreshCredentials();
        }, 300);
      }
      
    } catch (err) {
      console.error('Error deleting credential:', err);
      setError(err.response?.data?.message || 'An error occurred while deleting the credential');
      toast.error('Failed to delete credential');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="delete-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-lg w-full sm:max-w-md md:max-w-lg m-4 sm:m-auto">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            {/* Modal header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faKey} className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="ml-2 sm:ml-3 text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white" id="delete-modal-title">
                  Delete Credential
                </h3>
              </div>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={onClose}
                aria-label="Close modal"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="mt-2 sm:mt-3">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-3 sm:mb-4">
                  This action <span className="font-medium text-red-600 dark:text-red-400">cannot be undone</span>. 
                  This will permanently delete the credential <span className="font-medium text-gray-700 dark:text-gray-300">"{credential.name}"</span>.
                </p>
                
                <div className="mb-3 sm:mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-xs font-mono break-all">
                  <div className="text-gray-500 dark:text-gray-400">
                    <span className="inline-block min-w-[60px] sm:min-w-[80px] font-medium">Key:</span> 
                    <span className="text-gray-700 dark:text-gray-300">{credential.key}</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6">
                  <label htmlFor="confirm-name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    To confirm, type <span className="font-semibold">"{credential.name}"</span> below:
                  </label>
                  <input
                    type="text"
                    id="confirm-name"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    className={`block w-full rounded-md shadow-sm text-xs sm:text-sm ${
                      error
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500'
                    } dark:bg-gray-700 dark:text-white`}
                    placeholder={credential.name}
                    autoComplete="off"
                  />
                </div>
                
                {error && (
                  <div className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
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
              } px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto transition-colors duration-200`}
            >
              {isDeleting ? (
                <>
                  <span className="inline-block h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  Delete Credential
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 sm:mr-3 sm:w-auto transition-colors duration-200"
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteCredentialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  credential: PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    secret: PropTypes.string
  }),
  onDeleted: PropTypes.func.isRequired,
  onRefreshCredentials: PropTypes.func
};

export default DeleteCredentialModal; 