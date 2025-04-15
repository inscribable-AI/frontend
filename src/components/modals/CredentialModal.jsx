import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faEye, faEyeSlash, faPlus, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const CredentialModal = ({ credential, isOpen, onClose, onSave, isEditMode, requiredSecretKeys }) => {
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    secret: ''
  });
  
  // State for multiple secrets
  const [secretFields, setSecretFields] = useState([{ key: '', value: '' }]);
  const [showSecrets, setShowSecrets] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (credential) {
      setFormData({
        key: credential.key || '',
        name: credential.name || '',
        secret: credential.secret || ''
      });
      
      // If we have required secret keys from the tool, use those
      if (requiredSecretKeys && requiredSecretKeys.length > 0) {
        const initialFields = requiredSecretKeys.map(secretKeyInfo => ({
          key: secretKeyInfo.key,
          value: '',
          type: secretKeyInfo.type || 'string',
          required: secretKeyInfo.required || false,
          description: secretKeyInfo.description || ''
        }));
        setSecretFields(initialFields);
      } else {
        // If the secret is a JSON string, parse it and set secretFields
        try {
          const parsedSecret = JSON.parse(credential.secret || '{}');
          if (typeof parsedSecret === 'object' && parsedSecret !== null) {
            const fields = Object.entries(parsedSecret).map(([key, value]) => ({ key, value }));
            setSecretFields(fields.length > 0 ? fields : [{ key: '', value: '' }]);
          } else {
            // If it's not a valid object, set a single field with the entire secret as value
            setSecretFields([{ key: 'default', value: credential.secret || '' }]);
          }
        } catch (e) {
          // If parsing fails, it's not JSON, so use the entire secret as a single value
          setSecretFields([{ key: 'default', value: credential.secret || '' }]);
        }
      }
    } else {
      setFormData({
        key: '',
        name: '',
        secret: ''
      });
      setSecretFields([{ key: '', value: '' }]);
    }
  }, [credential, requiredSecretKeys]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle changes to secret fields
  const handleSecretFieldChange = (index, field, value) => {
    const updatedFields = [...secretFields];
    updatedFields[index][field] = value;
    setSecretFields(updatedFields);
    
    // Clear error for this field
    if (errors[`secretField-${index}-${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`secretField-${index}-${field}`]: null
      }));
    }
  };
  
  // Add a new secret field
  const addSecretField = () => {
    setSecretFields([...secretFields, { key: '', value: '', type: 'string' }]);
  };
  
  // Remove a secret field
  const removeSecretField = (index) => {
    // Don't allow removing if it's a required field from the tool
    if (secretFields[index].required) return;
    
    if (secretFields.length > 1) {
      const updatedFields = [...secretFields];
      updatedFields.splice(index, 1);
      setSecretFields(updatedFields);
    }
  };
  
  // Toggle visibility for a specific secret field
  const toggleSecretVisibility = (index) => {
    setShowSecrets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const validateValueForType = (value, type) => {
    if (!value.trim()) return true; // Empty values are handled by required validation
    
    // Safely check the type with a fallback to 'string'
    const safeType = (type || 'string').toLowerCase();
    
    switch (safeType) {
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return value === 'true' || value === 'false';
      case 'string':
      default:
        return true; // Strings accept any value
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key can only contain uppercase letters, numbers, and underscores';
    }
    
    // Validate secret fields
    let hasSecretData = false;
    secretFields.forEach((field, index) => {
      // Check for required fields from tool
      if (field.required && !field.value.trim()) {
        newErrors[`secretField-${index}-value`] = 'This field is required';
      }
      
      if (index === 0 && secretFields.length === 1 && !field.key.trim() && !field.value.trim()) {
        newErrors[`secretField-${index}-value`] = 'At least one secret value is required';
      }
      
      if (field.key.trim() && !field.value.trim()) {
        newErrors[`secretField-${index}-value`] = 'Value is required if key is provided';
      }
      
      if (!field.key.trim() && field.value.trim()) {
        newErrors[`secretField-${index}-key`] = 'Key is required if value is provided';
      }
      
      if (field.key.trim() && field.value.trim()) {
        hasSecretData = true;
      }
      
      // Check for duplicate keys
      const keyOccurrences = secretFields
        .filter(f => f.key.trim() === field.key.trim() && field.key.trim() !== '')
        .length;
      
      if (keyOccurrences > 1) {
        newErrors[`secretField-${index}-key`] = 'Duplicate keys are not allowed';
      }
      
      // Add type validation safely
      if (field.value.trim()) {
        const isValidForType = validateValueForType(field.value, field.type || 'string');
        if (!isValidForType) {
          newErrors[`secretField-${index}-value`] = `Value must be a ${field.type || 'string'}`;
        }
      }
    });
    
    if (!hasSecretData) {
      newErrors.secretGeneral = 'At least one secret key-value pair is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      try {
        // Create a secret object from the secret fields
        const secretObject = secretFields.reduce((obj, field) => {
          if (field.key.trim() && field.value.trim()) {
            // Convert value to the correct type - use a safe type check
            let typedValue = field.value.trim();
            const safeType = (field.type || 'string').toLowerCase();
            
            if (safeType === 'number') {
              typedValue = Number(typedValue);
            } else if (safeType === 'boolean') {
              typedValue = typedValue === 'true';
            }
            obj[field.key.trim()] = typedValue;
          }
          return obj;
        }, {});
        
        // Convert the secret object to a JSON string
        const secretJson = JSON.stringify(secretObject);
        
        // Update the formData with the JSON string secret
        const updatedFormData = {
          ...formData,
          secret: secretJson
        };
        
        onSave(updatedFormData);
      } catch (error) {
        console.error('Error saving credential:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  // Check if this is a credential being created from a tool requirement
  const isToolCredential = requiredSecretKeys && requiredSecretKeys.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <FontAwesomeIcon icon={faKey} className="mr-2 text-primary-600 dark:text-primary-400" />
              {isEditMode ? 'Edit Credential' : 'Add New Credential'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
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
                  placeholder="e.g., AWS Production API Key"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
              
              {/* Key input */}
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Credential Key
                </label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.key 
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500'
                  } dark:bg-gray-700 dark:text-white font-mono ${isEditMode || isToolCredential ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                  placeholder="e.g., AWS_ACCESS_KEY"
                  disabled={isEditMode || isToolCredential} // Can't change key in edit mode or for tool credentials
                />
                {errors.key && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.key}</p>
                )}
                {!errors.key && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use uppercase letters, numbers, and underscores only
                  </p>
                )}
              </div>
              
              {/* Multiple Secret fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isToolCredential ? 'Required Secret Values' : 'Secret Key-Value Pairs'}
                  </label>
                  {!isToolCredential && (
                    <button
                      type="button"
                      onClick={addSecretField}
                      className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Add Field
                    </button>
                  )}
                </div>
                
                {errors.secretGeneral && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">{errors.secretGeneral}</p>
                )}
                
                <div className="space-y-3">
                  {secretFields.map((field, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      {/* Field description if available */}
                      {field.description && (
                        <div className="mb-2 flex items-start text-xs text-gray-500 dark:text-gray-400">
                          <FontAwesomeIcon icon={faInfoCircle} className="mr-1 mt-0.5 flex-shrink-0" />
                          <span>{field.description}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Secret Key {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            placeholder="Secret Key"
                            value={field.key}
                            onChange={(e) => handleSecretFieldChange(index, 'key', e.target.value)}
                            disabled={isToolCredential || field.required}
                            className={`block w-full rounded-md shadow-sm ${
                              errors[`secretField-${index}-key`] 
                                ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500'
                            } dark:bg-gray-700 dark:text-white font-mono text-sm ${
                              isToolCredential || field.required ? 'bg-gray-100 dark:bg-gray-600' : ''
                            }`}
                          />
                          {errors[`secretField-${index}-key`] && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[`secretField-${index}-key`]}</p>
                          )}
                        </div>
                        
                        <div className="flex-1 relative">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Secret Value {field.required && <span className="text-red-500">*</span>}
                            {field.type && <span className="ml-1 text-xs text-gray-500">({field.type})</span>}
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              type={showSecrets[index] ? 'text' : 'password'}
                              placeholder={`Enter ${field.type || 'value'}`}
                              value={field.value}
                              onChange={(e) => handleSecretFieldChange(index, 'value', e.target.value)}
                              className={`block w-full rounded-md ${
                                errors[`secretField-${index}-value`] 
                                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500'
                              } pr-10 dark:bg-gray-700 dark:text-white font-mono text-sm`}
                            />
                            <button
                              type="button"
                              onClick={() => toggleSecretVisibility(index)}
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <FontAwesomeIcon icon={showSecrets[index] ? faEyeSlash : faEye} size="sm" />
                            </button>
                          </div>
                          {errors[`secretField-${index}-value`] && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[`secretField-${index}-value`]}</p>
                          )}
                        </div>
                        
                        {!isToolCredential && (
                          <button
                            type="button"
                            onClick={() => removeSecretField(index)}
                            disabled={secretFields.length === 1 || field.required}
                            className={`flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-md ${
                              secretFields.length === 1 || field.required
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                            }`}
                            aria-label="Remove field"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All secret values will be stored securely as a JSON object.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Preview of the constructed JSON */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">JSON Preview</h4>
              </div>
              <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(
                  secretFields.reduce((obj, field) => {
                    if (field.key.trim()) {
                      obj[field.key.trim()] = field.value ? "********" : "";
                    }
                    return obj;
                  }, {}),
                  null,
                  2
                )}
              </pre>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Credential'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CredentialModal.propTypes = {
  credential: PropTypes.shape({
    key: PropTypes.string,
    name: PropTypes.string,
    secret: PropTypes.string
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  requiredSecretKeys: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      type: PropTypes.string,
      required: PropTypes.bool,
      description: PropTypes.string
    })
  )
};

CredentialModal.defaultProps = {
  credential: null,
  isEditMode: false,
  requiredSecretKeys: null
};

export default CredentialModal; 