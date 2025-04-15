import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserAgent } from '../hooks/useTeams';
import PageWrapper from '../components/layout/PageWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faExclamationTriangle, faClipboardList, 
  faTools, faEye, faEdit, faTrash, faCog, faComment,
  faChartBar, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { AgentStats } from '../components/AgentStats';
//import { AgentsTable } from '../components/AgentsTable';
import { TaskTable } from '../components/TaskTable';
import { TablePagination } from '../components/TablePagination';
import { ChatSection } from '../components/ChatSection';
import { toast } from 'react-hot-toast';
import { agentV2API } from '../services/api';
import DeleteAgentModal from '../components/modals/DeleteAgentModal';

const AgentDetailsPage = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { agent, loading, error, fetchUserAgent } = useUserAgent(agentId);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // For super agents to display their tool agents
  const [toolAgentsPage, setToolAgentsPage] = useState(1);
  
  // Chat collapse state - default to collapsed on mobile, expanded on desktop
  const [isChatCollapsed, setIsChatCollapsed] = useState(window.innerWidth < 1024);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Fetch the agent when the ID changes
  useEffect(() => {
    if (agentId) {
      fetchUserAgent();
    }
  }, [agentId, fetchUserAgent]);
  
  // Listen for window resize to collapse chat on small screens
  useEffect(() => {
    const handleResize = () => {
      // Collapse chat on medium screens and smaller
      if (window.innerWidth < 1024 && !isChatCollapsed) {
        setIsChatCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isChatCollapsed]);
  
  // Determine agent type
  const isSuperAgent = agent?.id?.startsWith('SA_');
  const isToolAgent = agent?.id?.startsWith('TA_');
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Use different formats based on screen size (we'll apply this in the JSX)
    const fullDate = new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return fullDate;
  };
  
  // Update the delete handler to open the modal instead of direct deletion
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };
  
  // Handle successful deletion
  const handleAgentDeleted = () => {
    console.log("Agent deleted, navigating to dashboard...");
    // Force navigate to dashboard
    navigate('/dashboard', { replace: true });
  };
  
  // Handle editing an agent
  const handleEditAgent = (agentId) => {
    navigate(`/dashboard/agent/${agentId}/edit`);
  };
  
  // Pagination for tool agents in super agent
  const indexOfLastToolAgent = toolAgentsPage * itemsPerPage;
  const indexOfFirstToolAgent = indexOfLastToolAgent - itemsPerPage;
  const currentToolAgents = agent?.toolAgents?.slice(indexOfFirstToolAgent, indexOfLastToolAgent) || [];
  const totalToolAgentsPages = Math.ceil((agent?.toolAgents?.length || 0) / itemsPerPage);
  
  // Handle tool agents page change
  const handleToolAgentsPageChange = (pageNumber) => {
    setToolAgentsPage(pageNumber);
  };
  
  // Render loading state
  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      </PageWrapper>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <PageWrapper>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 dark:text-red-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-medium text-red-800 dark:text-red-300">Error loading agent</h3>
              <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mt-1 break-words">{error}</p>
              <div className="mt-3 flex space-x-3">
                <button 
                  onClick={() => fetchUserAgent()}
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                >
                  Retry
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 underline"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  // Render if agent not found
  if (!agent) {
    return (
      <PageWrapper>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 dark:text-yellow-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-medium text-yellow-800 dark:text-yellow-300">Agent not found</h3>
              <p className="text-sm sm:text-base text-yellow-600 dark:text-yellow-400 mt-1">The requested agent could not be found.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-3 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 underline"
              >
                Return to dashboard
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className={`flex-1 ${isChatCollapsed ? 'lg:mr-[50px]' : 'lg:mr-[400px]'} transition-all duration-300`}>
        <PageWrapper>
          {/* Back to Dashboard button */}
          <div className="mb-3 sm:mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-xs sm:text-sm rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back to</span> Dashboard
            </button>
          </div>
          
          {/* Agent Header */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 transition-all duration-200 hover:shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start sm:items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                  <FontAwesomeIcon 
                    icon={faRobot} 
                    className={`h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 ${
                      isSuperAgent 
                        ? 'text-purple-500 dark:text-purple-400' 
                        : 'text-primary-600 dark:text-primary-400'
                    }`}
                  />
                </div>
                <div className="ml-2 sm:ml-3 md:ml-4">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{agent.name}</h1>
                  <div className="flex flex-wrap items-center mt-1 gap-1 sm:gap-2">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isSuperAgent 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                        : 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                    }`}>
                      {isSuperAgent ? 'Super Agent' : 'Tool Agent'}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden xs:inline">
                      ID: <span className="font-mono text-xs">{agent.id}</span>
                    </span>
                    <span className="mx-1 sm:mx-2 text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="hidden sm:inline">Created </span>{formatDate(agent.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap mt-3 lg:mt-0 gap-1.5 sm:gap-2 justify-start lg:justify-end">
                <button
                  onClick={() => navigate(`/dashboard/agent/${agent.id}/tasks`)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="hidden xs:inline">View</span> Tasks
                </button>
                
                <button
                  onClick={() => handleEditAgent(agent.id)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="hidden xs:inline">Edit</span>
                </button>
                
                <button
                  onClick={() => setIsChatCollapsed(false)}
                  className="lg:hidden inline-flex items-center px-2 sm:px-3 py-1.5 border border-primary-300 dark:border-primary-700 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-primary-700 dark:text-primary-400 bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FontAwesomeIcon icon={faComment} className="mr-1 sm:mr-2 text-primary-500 dark:text-primary-400" />
                  <span className="hidden xs:inline">Chat</span>
                </button>
                
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-red-300 dark:border-red-700 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1 sm:mr-2 text-red-500 dark:text-red-400" />
                  <span className="hidden xs:inline">Delete</span>
                </button>
              </div>
            </div>
            
            {/* Agent Description */}
            {agent.description && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">{agent.description}</p>
              </div>
            )}
            
            {/* Display ID on small screens */}
            <div className="mt-2 block xs:hidden text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">ID:</span> <span className="font-mono">{agent.id}</span>
            </div>
          </div>
          
          {/* Tool Agent specific info */}
          {isToolAgent && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <FontAwesomeIcon icon={faTools} className="mr-2 text-primary-600 dark:text-primary-400" />
                Tools
              </h2>
              
              {agent.tools && agent.tools.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                  {agent.tools.map((tool, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-4 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-1">{tool.name}</div>
                      {tool.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{tool.description}</p>
                      )}
                      {tool.category && (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                          {tool.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No tools associated with this agent.</p>
              )}
            </div>
          )}
          
          {/* Super Agent specific info - Tool agents table */}
          {isSuperAgent && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-2 text-primary-600 dark:text-primary-400" />
                Tool Agents
              </h2>
              
              {agent.toolAgents && agent.toolAgents.length > 0 ? (
                <>
                  <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
                    <div className="inline-block min-w-full align-middle p-3 sm:p-4 md:p-6">
                      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                              <th scope="col" className="hidden sm:table-cell px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                              <th scope="col" className="hidden md:table-cell px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tools</th>
                              <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentToolAgents.map(toolAgent => (
                              <tr key={toolAgent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                                  <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{toolAgent.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden max-w-[120px] font-mono">{toolAgent.id}</div>
                                </td>
                                <td className="hidden sm:table-cell px-4 md:px-6 py-2 sm:py-4">
                                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {toolAgent.description || 'No description'}
                                  </div>
                                </td>
                                <td className="hidden md:table-cell px-4 md:px-6 py-2 sm:py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {toolAgent.tools && toolAgent.tools.slice(0, 2).map((tool, index) => (
                                      <span 
                                        key={index} 
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                                      >
                                        {tool.name || tool.id}
                                      </span>
                                    ))}
                                    {toolAgent.tools && toolAgent.tools.length > 2 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        +{toolAgent.tools.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-1 sm:space-x-2">
                                    <button 
                                      onClick={() => navigate(`/dashboard/agent/${toolAgent.id}`)}
                                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                      aria-label="View agent details"
                                    >
                                      <FontAwesomeIcon icon={faEye} size="sm" />
                                    </button>
                                    <button 
                                      onClick={() => handleEditAgent(toolAgent.id)}
                                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                      aria-label="Edit agent"
                                    >
                                      <FontAwesomeIcon icon={faCog} size="sm" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pagination for tool agents - make responsive */}
                  {agent.toolAgents.length > itemsPerPage && (
                    <div className="mt-3 sm:mt-4">
                      <TablePagination 
                        currentPage={toolAgentsPage}
                        totalPages={totalToolAgentsPages}
                        onPageChange={handleToolAgentsPageChange}
                        totalItems={agent.toolAgents.length}
                        itemsPerPage={itemsPerPage}
                        currentPageFirstItemIndex={indexOfFirstToolAgent + 1}
                        currentPageLastItemIndex={Math.min(indexOfLastToolAgent, agent.toolAgents.length)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No tool agents associated with this super agent.</p>
              )}
            </div>
          )}
          
          {/* Agent Stats */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 transition-all duration-200 hover:shadow-md">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-2 text-primary-600 dark:text-primary-400" />
              Agent Statistics
            </h2>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <AgentStats 
                  toolAgents={isToolAgent ? [agent] : []}
                  superAgents={isSuperAgent ? [agent] : []}
                  tasks={[]} // You'll need to fetch tasks for this agent here
                />
              </div>
            </div>
          </div>
          
          {/* Recent Tasks */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 transition-all duration-200 hover:shadow-md">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-primary-600 dark:text-primary-400" />
              Recent Tasks
            </h2>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <TaskTable agentId={agent.id} />
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>
      
      {/* Chat section - improved for all screen sizes */}
      <div 
        className={`fixed inset-0 lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 z-50 transition-transform duration-300 ${
          isChatCollapsed ? 'translate-x-full lg:translate-x-[calc(100%-50px)]' : 'translate-x-0'
        }`}
        aria-hidden={isChatCollapsed}
      >
        <ChatSection 
          team={agent} // Pass agent instead of team
          isCollapsed={isChatCollapsed}
          onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
        />
      </div>
      
      {/* Floating chat toggle button - only visible when collapsed on mobile/tablet */}
      {isChatCollapsed && (
        <button 
          onClick={() => setIsChatCollapsed(false)}
          className="fixed bottom-4 right-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg z-40 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          aria-label="Open chat"
        >
          <FontAwesomeIcon icon={faComment} className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
      
      {/* Delete confirmation modal */}
      <DeleteAgentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        agent={agent}
        onDeleted={handleAgentDeleted}
      />
    </div>
  );
};

export default AgentDetailsPage; 