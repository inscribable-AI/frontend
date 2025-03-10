import React, { useState } from 'react';
import { EditAgentModal } from './EditAgentModal';
import { AgentExtraInfo } from './AgentExtraInfo';

export function TeamMembersTable({ members, currentPage, membersPerPage, handleEditAgent }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members?.slice(indexOfFirstMember, indexOfLastMember) || [];

  const handleOpenEditModal = (member) => {
    setSelectedAgent(member);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedAgent(null);
    setIsEditModalOpen(false);
  };

  const handleSaveAgent = async (formData) => {
    setIsSubmitting(true);
    try {
      await handleEditAgent(selectedAgent.id, formData);
      handleCloseEditModal();
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentMembers.map((member) => (
              <React.Fragment key={member.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
                {member.teamProvision === 1 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4">
                      <AgentExtraInfo agent={member} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && selectedAgent && (
        <EditAgentModal
          agent={selectedAgent}
          onClose={handleCloseEditModal}
          onSave={handleSaveAgent}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
} 