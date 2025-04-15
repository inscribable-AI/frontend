import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAgents } from '../hooks/useTeams';
import PageWrapper from '../components/layout/PageWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faPlus, faFilter, faSort } from '@fortawesome/free-solid-svg-icons';
import { AgentsTable } from '../components/AgentsTable';
import { TablePagination } from '../components/TablePagination';

const SuperAgentsPage = () => {
  const navigate = useNavigate();
  const { agents, loading, error, fetchUserAgents } = useUserAgents();
  const [currentPage, setCurrentPage] = useState(1);
  const [agentsPerPage] = useState(10);
  
  useEffect(() => {
    fetchUserAgents();
  }, [fetchUserAgents]);
  
  // Filter for only super agents
  const superAgents = agents?.superAgents || [];
  
  // Pagination
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = superAgents.slice(indexOfFirstAgent, indexOfLastAgent);
  const totalPages = Math.ceil(superAgents.length / agentsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleCreateAgent = () => {
    navigate('/create-super-agent');
  };
  
  const handleEditAgent = (agentId) => {
    navigate(`/dashboard/agent/${agentId}/edit`);
  };
  
  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faBrain} className="mr-3 text-purple-500 dark:text-purple-400" />
          Super Agents
        </h1>
        <button
          onClick={handleCreateAgent}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create Super Agent
        </button>
      </div>
      
      {/* Filter and sort controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search super agents..."
              className="pl-10 pr-3 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <FontAwesomeIcon icon={faSort} className="mr-2" />
            Sort
          </button>
        </div>
      </div>
      
      {/* Agent stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Super Agents</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              superAgents.length.toString()
            )}
          </h2>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Tool Agents Used</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              // Count unique tool agents used across all super agents
              new Set(
                superAgents.flatMap(agent => 
                  agent.toolAgents?.map(ta => ta.id) || []
                )
              ).size.toString()
            )}
          </h2>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Tools per Agent</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {loading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : superAgents.length > 0 ? (
              (superAgents.reduce((sum, agent) => sum + (agent.toolAgents?.length || 0), 0) / superAgents.length).toFixed(1)
            ) : (
              '0.0'
            )}
          </h2>
        </div>
      </div>
      
      {/* Agents Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading super agents</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={fetchUserAgents}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : superAgents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <FontAwesomeIcon icon={faBrain} className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No super agents found</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Super agents combine multiple tool agents to solve complex tasks.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreateAgent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Create Super Agent
            </button>
          </div>
        </div>
      ) : (
        <div>
          <AgentsTable 
            agents={currentAgents}
            currentPage={currentPage}
            agentsPerPage={agentsPerPage}
            handleEditAgent={handleEditAgent}
          />
          
          {/* Pagination */}
          {superAgents.length > agentsPerPage && (
            <div className="mt-4">
              <TablePagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={superAgents.length}
                itemsPerPage={agentsPerPage}
                currentPageFirstItemIndex={indexOfFirstAgent + 1}
                currentPageLastItemIndex={Math.min(indexOfLastAgent, superAgents.length)}
              />
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default SuperAgentsPage; 