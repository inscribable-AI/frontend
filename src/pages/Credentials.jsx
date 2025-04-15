import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faEye, faEyeSlash, faCopy, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import PageWrapper from '../components/layout/PageWrapper';
import { AuthContext } from '../contexts/AuthContext';
import CredentialModal from '../components/modals/CredentialModal';
import DeleteCredentialModal from '../components/modals/DeleteCredentialModal';
import { userAPI } from '../services/api';

function Credentials() {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentCredential, setCurrentCredential] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  // Fetch credentials when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCredentials();
    }
  }, [isAuthenticated]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {    
      const response = await userAPI.getUserCredentials();
      setCredentials(response.data || []); // Ensure we always have an array
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to load credentials');
      console.error('Error fetching credentials:', error);
      setCredentials([]); // Reset to empty array on error
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = (id) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopySecret = (secret) => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  const handleOpenModal = (credential = null, isEdit = false) => {
    console.log("Opening modal with credential:", credential);
    setCurrentCredential(credential);
    setIsEditMode(!!credential); // Set edit mode based on whether we have a credential
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Use setTimeout to avoid state updates conflicting
    setTimeout(() => {
      setCurrentCredential(null);
      setIsEditMode(false);
    }, 100);
  };

  const handleOpenDeleteModal = (credential) => {
    setCurrentCredential(credential);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setCurrentCredential(null);
  };

  const handleSaveCredential = async (credentialData) => {
    try {
      if (isEditMode) {
        // Update existing credential
        await userAPI.updateUserCredential({
          key: credentialData.key,
          name: credentialData.name,
          value: credentialData.secret
        });
        
        toast.success('Credential updated successfully');
      } else {
        // Create new credential
        await userAPI.storeUserCredential({
          key: credentialData.key,
          secret: credentialData.secret,
          name: credentialData.name
        });
        
        toast.success('Credential added successfully');
      }
      
      // Close the modal first
      handleCloseModal();
      
      // Then refresh the credentials list to show the new/updated credential
      fetchCredentials();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isEditMode ? 'Failed to update credential' : 'Failed to add credential');
      toast.error(errorMessage);
      console.error('Error saving credential:', error);
    }
  };

  const handleCredentialDeleted = (deletedKey) => {
    // Remove the credential from the local state for immediate UI update
    setCredentials(prev => prev.filter(cred => cred.key !== deletedKey));
    
    // Also refresh all credentials to ensure we have the latest data
    fetchCredentials();
  };

  // Mask secret value for display
  const maskSecret = (secret) => {
    if (!secret) return '';
    try {
      // Check if it's a JSON string
      JSON.parse(secret);
      return "{ JSON Object }";
    } catch (e) {
      // If not JSON, show masked value
      const firstChars = secret.substring(0, 3);
      const lastChars = secret.substring(secret.length - 3);
      return `${firstChars}...${lastChars}`;
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FontAwesomeIcon 
                icon={faKey} 
                className="mr-3 text-primary-600 dark:text-primary-400" 
              />
              Credentials
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage secure credentials for your agents and tools
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(null, false)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Credential
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>
        ) : credentials.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <FontAwesomeIcon icon={faKey} className="text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No credentials found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Add your first credential to securely store API keys and passwords.
            </p>
            <button
              onClick={() => handleOpenModal(null, false)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-800/30"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Credential
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Key
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Secret
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {credentials.map((credential) => (
                    <tr key={credential.key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {credential.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-mono">{credential.key}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <code className="font-mono overflow-hidden max-w-[150px] sm:max-w-[250px] truncate">
                            {showSecrets[credential.key] ? credential.secret : maskSecret(credential.secret)}
                          </code>
                          <button
                            onClick={() => handleToggleVisibility(credential.key)}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label={showSecrets[credential.key] ? "Hide secret" : "Show secret"}
                          >
                            <FontAwesomeIcon icon={showSecrets[credential.key] ? faEyeSlash : faEye} />
                          </button>
                          <button
                            onClick={() => handleCopySecret(credential.secret)}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Copy secret"
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(credential, true)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(credential)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Credential Modal for Add/Edit */}
      {modalOpen && (
        <CredentialModal
          credential={currentCredential}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCredential}
          isEditMode={isEditMode}
        />
      )}

      {/* Delete Credential Modal */}
      {deleteModalOpen && (
        <DeleteCredentialModal
          credential={currentCredential}
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onDeleted={handleCredentialDeleted}
          onRefreshCredentials={fetchCredentials}
        />
      )}
    </PageWrapper>
  );
}

export default Credentials; 