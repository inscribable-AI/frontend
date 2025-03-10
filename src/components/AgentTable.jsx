import React, { useState, useEffect } from 'react';
import { TablePagination } from './TablePagination';
import { firebaseService } from '../services/firebaseService';

export function AgentTable({ teamId }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [agentsPerPage] = useState(5); // Show 5 agents per page
  const [lastAgentId, setLastAgentId] = useState(null);
  const [hasMoreAgents, setHasMoreAgents] = useState(true);

  useEffect(() => {
    if (teamId) {
      // Reset states when teamId changes
      setAgents([]);
      setLastAgentId(null);
      setHasMoreAgents(true);
      setCurrentPage(1);
      fetchAgents();
    }
  }, [teamId]);

  // Load more agents when needed
  useEffect(() => {
    const totalNeeded = currentPage * agentsPerPage;
    if (totalNeeded > agents.length && hasMoreAgents && !loading) {
      fetchAgents();
    }
  }, [currentPage]);

  const fetchAgents = async () => {
    if (loading || !hasMoreAgents) return;
    
    setLoading(true);
    setError(null);
    try {
      // Use explicit agentsPerPage (5) instead of default 10
      const fetchedAgents = await firebaseService.getAgentsByTeamId(teamId, agentsPerPage, lastAgentId);
      console.log("Fetched agents:", fetchedAgents?.length);
      
      if (fetchedAgents && fetchedAgents.length > 0) {
        setAgents(prev => [...prev, ...fetchedAgents]);
        setLastAgentId(fetchedAgents[fetchedAgents.length - 1].id);
        setHasMoreAgents(fetchedAgents.length === agentsPerPage);
      } else {
        setHasMoreAgents(false);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to load agents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent);
  const totalPages = Math.ceil(agents.length / agentsPerPage);

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-8">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Agents</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tasks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentAgents.length > 0 ? (
                currentAgents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.name || "Unnamed Agent"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {agent.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {agent.agentType || "Standard"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        agent.status === 'disabled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {agent.status === 'active' ? 'Active' :
                         agent.status === 'disabled' ? 'Disabled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {agent.taskCount || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No agents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add the TablePagination component if there are agents and not loading */}
      {!loading && agents.length > 0 && (
        <TablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={agents.length}
          itemsPerPage={agentsPerPage}
          currentPageFirstItemIndex={indexOfFirstAgent}
          currentPageLastItemIndex={indexOfLastAgent}
        />
      )}
    </div>
  );
} 