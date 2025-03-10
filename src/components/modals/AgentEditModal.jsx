import React, { useState } from 'react';
import { useAgent } from '../../hooks/useAgents';

function AgentEditModal({ agent, isOpen, onClose }) {
  const { updateAgentCredentials, updateAgentAttributes } = useAgent();
  const [credentials, setCredentials] = useState(agent.credentials || {});
  const [attributes, setAttributes] = useState(agent.attributes || {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateAgentCredentials(agent.id, credentials);
    await updateAgentAttributes(agent.id, attributes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Agent Configuration</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update credentials and attributes for {agent.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Credentials Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Required Credentials</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={credentials.apiKey || ''}
                  onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={credentials.endpoint || ''}
                  onChange={(e) => setCredentials({ ...credentials, endpoint: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Optional Attributes</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={attributes.systemPrompt || ''}
                  onChange={(e) => setAttributes({ ...attributes, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model Configuration
                </label>
                <select
                  value={attributes.model || ''}
                  onChange={(e) => setAttributes({ ...attributes, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-2">Claude 2</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgentEditModal; 