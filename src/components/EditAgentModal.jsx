import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export function EditAgentModal({ agent, onClose, onSave, isSubmitting }) {
  // Initialize formData based on tools' credentials
  const [formData, setFormData] = useState(() => {
    const credentials = {};
    
    // Combine all unique credentials from all tools
    agent.tools?.forEach(tool => {
      if (tool.credentials) {
        Object.entries(tool.credentials).forEach(([key, value]) => {
          credentials[key] = {
            value: '',
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            required: true,
            toolName: tool.name
          };
        });
      }
    });

    return {
      credentials,
      attributes: agent.attributes || {}
    };
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    Object.entries(formData.credentials).forEach(([key, field]) => {
      if (field.required && !field.value?.trim()) {
        newErrors[`credentials.${key}`] = `${field.label} is required`;
      }
    });
    
    Object.entries(formData.attributes).forEach(([key, field]) => {
      if (field.required && !field.value?.trim()) {
        newErrors[`attributes.${key}`] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          ...prev[section][key],
          value: value
        }
      }
    }));

    if (errors[`${section}.${key}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${key}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  const renderField = (section, key, field) => {
    const baseFieldClasses = "w-full h-[38px] px-4 py-2 rounded-lg border transition-all duration-200 ease-in-out";
    const fieldColors = `${
      errors[`${section}.${key}`] 
        ? 'border-red-300 focus:border-red-500' 
        : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`;

    return (
      <div>
        <input
          type={field.type || (section === 'credentials' ? "password" : "text")}
          id={`${section}-${key}`}
          value={field.value || ""}
          onChange={(e) => handleChange(section, key, e.target.value)}
          className={`${baseFieldClasses} ${fieldColors} focus:outline-none focus:ring-0`}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
        {section === 'credentials' && field.toolName && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used by: {field.toolName}
          </p>
        )}
      </div>
    );
  };

  const renderSection = (title, section, icon) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-y-4">
        {Object.entries(formData[section]).map(([key, field]) => (
          <div key={key} className="w-full">
            <label 
              htmlFor={`${section}-${key}`} 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(section, key, field)}
            {errors[`${section}.${key}`] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors[`${section}.${key}`]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>
        
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit {agent.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update agent credentials and attributes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderSection(
              "Credentials",
              "credentials",
              <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}

            {Object.keys(formData.attributes).length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {renderSection(
                  "Attributes",
                  "attributes",
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                } transition-colors`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 