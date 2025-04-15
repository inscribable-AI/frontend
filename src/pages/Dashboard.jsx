import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  registerables
} from 'chart.js';
import PageWrapper from '../components/layout/PageWrapper';
import { useNavigate } from 'react-router-dom';
import { useUserAgents } from '../hooks/useTeams';
import ChartCard from '../components/charts/ChartCard';
import StatCard from '../components/stats/StatCard';
import { TablePagination } from '../components/TablePagination';
import {taskAPI} from '../services/api';
import { userAPI } from '../services/api';
import { firebaseService } from '../services/firebaseService';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRobot, faBrain } from '@fortawesome/free-solid-svg-icons';

// Register all necessary Chart.js components
ChartJS.register(...registerables);

function Dashboard() {
  const navigate = useNavigate();
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [agentsPerPage] = useState(15);
  
  // Date filter states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to 30 days ago
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  
  const { agents, loading, error, fetchUserAgents } = useUserAgents();

  // Update state for task summary to match the API response
  const [taskSummary, setTaskSummary] = useState({
    totalTasks: 0,
    totalCompleted: 0,
    totalFailed: 0,
    averageProcessingTime: 0
  });
  
  const [isLoadingTaskSummary, setIsLoadingTaskSummary] = useState(true);

  // Add state for user ID
  const [userId, setUserId] = useState(null);

  // Add this state variable to your component
  const [isLoadingActivityData, setIsLoadingActivityData] = useState(false);

  // Add state for create menu
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Add function to fetch user ID
  const fetchUserId = async () => {
    try {
      // Option 1: Get user ID from API
      const userResponse = await userAPI.getUser();
      const id = userResponse.data.id || userResponse.data._id || userResponse.data.userId;
      setUserId(id);
      return id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      
      // Option 2: Try to get from localStorage if you store it there
      const storedId = localStorage.getItem('userId');
      if (storedId) {
        setUserId(storedId);
        return storedId;
      }
      
      console.error('Could not retrieve user ID');
      return null;
    }
  };

  // Add effect to fetch user ID on component mount
  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchUserAgents();
  }, [fetchUserAgents]);

  // Add a separate useEffect to fetch task summary
  useEffect(() => {
    fetchTaskSummary();
  }, []); // Empty dependency array means run once on mount

  // Update pagination to handle combined agent lists
  const totalAgents = (agents?.toolAgents?.length || 0) + (agents?.superAgents?.length || 0);
  const totalPages = Math.ceil(totalAgents / agentsPerPage);

  // If you're still using teams-related variables in pagination, you'll need to adapt:
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;

  // You'll need a combined array for pagination
  const currentAgents = [
    ...(agents?.toolAgents || []),
    ...(agents?.superAgents || [])
  ].slice(indexOfFirstAgent, indexOfLastAgent);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate realistic sample data for the task calls chart based on date range
  const generateChartData = () => {
    // Convert string dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate number of days in the range
    const daysDiff = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
    
    // Generate dates for the selected range
    const dates = Array.from({ length: daysDiff }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Generate a more realistic data pattern for task calls
    let value = 2000;
    const values = [];
    
    for (let i = 0; i < daysDiff; i++) {
      // Add some randomness but maintain a trend
      const change = Math.random() * 500 - 200;
      
      // Create a pattern based on position in the range
      const position = i / daysDiff;
      if (position > 0.2 && position < 0.5) {
        value += Math.random() * 400;
      } else if (position >= 0.5 && position < 0.8) {
        value -= Math.random() * 300;
      } else {
        value += change;
      }
      
      // Ensure value doesn't go below 1000
      value = Math.max(1000, value);
      values.push(Math.round(value)); // Round to whole numbers for task counts
    }

    return {
      labels: dates,
      datasets: [
        {
          label: 'Task Calls',
          data: values,
          borderColor: 'rgb(221, 79, 193)',
          backgroundColor: 'rgba(221, 79, 193, 0.1)',
          fill: true,
        }
      ]
    };
  };

  // Regenerate chart data when date range changes
  const [taskChartData, setTaskChartData] = useState(generateChartData());
  
  useEffect(() => {
    setTaskChartData(generateChartData());
  }, [startDate, endDate]);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date to a more readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Date range preset handlers
  const setDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  // Get the total number of teams
  const totalTeams = Array.isArray(agents) ? agents.length : 0;

  // Update function to fetch task summary
  const fetchTaskSummary = async () => {
    setIsLoadingTaskSummary(true);
    try {
      const response = await taskAPI.getUserTaskSummary();
      
      // Use the summary data directly as it already includes averageProcessingTime
      setTaskSummary({
        totalTasks: response.data.totalTasks || 0,
        totalCompleted: response.data.totalCompleted || 0,
        totalFailed: response.data.totalFailed || 0,
        averageProcessingTime: response.data.averageProcessingTime || 0
      });
    } catch (error) {
      console.error('Error fetching task summary:', error);
    } finally {
      setIsLoadingTaskSummary(false);
    }
  };

  // Modify fetchTaskActivityFromFirebase to use userId from state
  const fetchTaskActivityFromFirebase = async () => {
    setIsLoadingActivityData(true);
    try {
      // Get or fetch user ID if not available
      let id = userId;
      if (!id) {
        id = await fetchUserId();
        if (!id) {
          console.error('No user ID available, cannot fetch task activity');
          setIsLoadingActivityData(false);
          return;
        }
      }
      
      // Call the Firebase method
      const activityData = await firebaseService.getUserTaskActivityByDateRange(
        id, 
        startDate, 
        endDate
      );
      
      // Transform the data for the chart
      if (activityData.length > 0) {
        const labels = activityData.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const values = activityData.map(item => item.count);
        
        // Update chart data with new color scheme
        setTaskChartData({
          labels,
          datasets: [
            {
              label: 'Task Calls',
              data: values,
              borderColor: 'rgb(221, 79, 193)',
              backgroundColor: 'rgba(221, 79, 193, 0.1)',
              fill: true,
            }
          ]
        });
      } else {
        // If no data, use empty chart data
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
        
        const dates = Array.from({ length: daysDiff }, (_, i) => {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        setTaskChartData({
          labels: dates,
          datasets: [
            {
              label: 'Task Calls',
              data: Array(daysDiff).fill(0),
              borderColor: 'rgb(221, 79, 193)',
              backgroundColor: 'rgba(221, 79, 193, 0.1)',
              fill: true,
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching task activity data:', error);
    } finally {
      setIsLoadingActivityData(false);
    }
  };

  // Only fetch task activity when userId and date range are available
  useEffect(() => {
    if (userId) {
      fetchTaskActivityFromFirebase();
    }
  }, [userId, startDate, endDate]);

  // Navigate to agent details when clicked
  const handleAgentClick = (agentId) => {
    navigate(`/dashboard/agent/${agentId}`);
  };

  return (
    <PageWrapper>
      {/* Header Section - Responsive improvements */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage all your Agents here</p>
        </div>
        
        {/* Create Agent dropdown - Responsive improvements */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
            aria-expanded={isCreateMenuOpen}
            aria-haspopup="true"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create Agent
          </button>
          
          {isCreateMenuOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-full sm:w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                  role="menuitem"
                  onClick={() => {
                    navigate('/dashboard/tool-agents/create');
                    setIsCreateMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                      <FontAwesomeIcon icon={faRobot} />
                    </span>
                    <div>
                      <p className="font-medium">Create Tool Agent</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Create an agent with specific tools</p>
                    </div>
                  </div>
                </button>
                <button
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                  role="menuitem"
                  onClick={() => {
                    navigate('/dashboard/super-agents/create');
                    setIsCreateMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                      <FontAwesomeIcon icon={faBrain} />
                    </span>
                    <div>
                      <p className="font-medium">Create Super Agent</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Create an agent that uses other agents</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Responsive improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg shadow-sm p-4 md:p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">active agents</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-dark-elevated rounded"></div>
                ) : (
                  ((agents?.toolAgents?.length || 0) + (agents?.superAgents?.length || 0)).toString()
                )}
              </h2>
            </div>
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center text-xs sm:text-sm gap-1 sm:gap-0">
            <span className="text-primary-600 dark:text-primary-400 font-medium mr-1 sm:mr-2">
              {agents?.toolAgents?.length || 0}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Tool Agents
            </span>
            <span className="mx-1 sm:mx-2 text-gray-300 dark:text-gray-600">|</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium mr-1 sm:mr-2">
              {agents?.superAgents?.length || 0}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Super Agents
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg shadow-sm p-4 md:p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">tasks completed</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                {isLoadingTaskSummary ? (
                  <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-dark-elevated rounded"></div>
                ) : (
                  taskSummary.totalCompleted.toString()
                )}
              </h2>
            </div>
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{Math.round((taskSummary.totalCompleted / (taskSummary.totalTasks || 1)) * 100)}%</span> success rate
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg shadow-sm p-4 md:p-6 transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">average response time</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                {isLoadingTaskSummary ? (
                  <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-dark-elevated rounded"></div>
                ) : (
                  `${Math.round(taskSummary.averageProcessingTime / 1000)}s`
                )}
              </h2>
            </div>
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Response</span> time for tasks
          </div>
        </div>
      </div>

      {/* Agents Table Section - Responsive improvements */}
      <div id="agents" className="bg-white dark:bg-dark-surface rounded-lg shadow-sm overflow-hidden mb-6 md:mb-8">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">Agents</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {((agents?.toolAgents?.length || 0) + (agents?.superAgents?.length || 0))} agents
            </span>
            <button
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-elevated"
              aria-label={isTableExpanded ? "Collapse table" : "Expand table"}
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isTableExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className={`transition-all duration-300 ${isTableExpanded ? 'h-[500px] sm:h-[600px] md:h-[800px]' : 'h-[300px] sm:h-[350px] md:h-[400px]'}`}>
          <div className="h-full flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-500 dark:text-red-400 p-4 text-center">
                {error}
              </div>
            ) : !agents || ((!agents.toolAgents || agents.toolAgents.length === 0) && 
               (!agents.superAgents || agents.superAgents.length === 0)) ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 mb-3">No agents found</p>
                <button 
                  onClick={() => navigate('/dashboard/tool-agents/create')}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Create your first agent
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                {/* Mobile view for agents - card layout */}
                <div className="sm:hidden px-4 py-3 divide-y divide-gray-200 dark:divide-dark-border">
                  {/* Render Tool Agents for mobile */}
                  {agents?.toolAgents?.map((agent) => (
                    <div 
                      key={agent.id} 
                      className="py-3 cursor-pointer"
                      onClick={() => handleAgentClick(agent.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{agent.id.substring(0, 8)}...</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Tool Agent
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {agent.tools && agent.tools.slice(0, 3).map((tool, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                            {tool.name || tool.id}
                          </span>
                        ))}
                        {agent.tools && agent.tools.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                            +{agent.tools.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created {formatDate(agent.createdAt)}
                      </div>
                    </div>
                  ))}

                  {/* Render Super Agents for mobile */}
                  {agents?.superAgents?.map((agent) => (
                    <div 
                      key={agent.id} 
                      className="py-3 cursor-pointer"
                      onClick={() => handleAgentClick(agent.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{agent.id.substring(0, 8)}...</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Super Agent
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {agent.toolAgents && agent.toolAgents.slice(0, 3).map((toolAgent, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                            {toolAgent.name}
                          </span>
                        ))}
                        {agent.toolAgents && agent.toolAgents.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                            +{agent.toolAgents.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created {formatDate(agent.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view for agents - table layout */}
                <div className="hidden sm:block min-w-full">
                  <div className="sticky top-0 z-10 grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 dark:bg-dark-elevated text-sm font-medium text-gray-500 dark:text-gray-400">
                    <div>Agent ID</div>
                    <div>Name</div>
                    <div>Type</div>
                    <div>Tools</div>
                    <div>Created At</div>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-dark-border">
                    {/* Render Tool Agents */}
                    {agents?.toolAgents?.map((agent) => (
                      <div 
                        key={agent.id} 
                        className="grid grid-cols-5 gap-4 px-6 py-4 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                        onClick={() => handleAgentClick(agent.id)}
                      >
                        <div className="text-gray-500 dark:text-gray-400 font-mono truncate">
                          {agent.id.substring(0, 8)}...
                        </div>
                        <div className="text-gray-900 dark:text-white font-medium truncate">
                          {agent.name}
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Tool Agent
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="flex flex-wrap gap-1">
                            {agent.tools && agent.tools.slice(0, 3).map((tool, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                                {tool.name || tool.id}
                              </span>
                            ))}
                            {agent.tools && agent.tools.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                                +{agent.tools.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {formatDate(agent.createdAt)}
                        </div>
                      </div>
                    ))}

                    {/* Render Super Agents */}
                    {agents?.superAgents?.map((agent) => (
                      <div 
                        key={agent.id} 
                        className="grid grid-cols-5 gap-4 px-6 py-4 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                        onClick={() => handleAgentClick(agent.id)}
                      >
                        <div className="text-gray-500 dark:text-gray-400 font-mono truncate">
                          {agent.id.substring(0, 8)}...
                        </div>
                        <div className="text-gray-900 dark:text-white font-medium truncate">
                          {agent.name}
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Super Agent
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="flex flex-wrap gap-1">
                            {agent.toolAgents && agent.toolAgents.slice(0, 3).map((toolAgent, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                                {toolAgent.name}
                              </span>
                            ))}
                            {agent.toolAgents && agent.toolAgents.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">
                                +{agent.toolAgents.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {formatDate(agent.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pagination component with responsive adjustments */}
            <TablePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
              totalItems={(agents?.toolAgents?.length || 0) + (agents?.superAgents?.length || 0)}
              itemsPerPage={agentsPerPage}
              currentPageFirstItemIndex={indexOfFirstAgent}
              currentPageLastItemIndex={Math.min(indexOfLastAgent, (agents?.toolAgents?.length || 0) + (agents?.superAgents?.length || 0))}
            />
          </div>
        </div>
      </div>

      {/* Chart Section with Responsive Date Filters */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-0">
                Task Calls
              </h3>
              
              {/* Date range presets - More responsive */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
                <button 
                  onClick={() => setDateRange(7)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-dark-elevated text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-primary-900/20 transition-colors"
                >
                  Last 7 days
                </button>
                <button 
                  onClick={() => setDateRange(30)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-dark-elevated text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-primary-900/20 transition-colors"
                >
                  Last 30 days
                </button>
                <button 
                  onClick={() => setDateRange(90)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-dark-elevated text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-primary-900/20 transition-colors"
                >
                  Last 90 days
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-end gap-3">
              <div className="relative">
                <label htmlFor="start-date" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  From
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-dark-border rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-elevated focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="relative">
                <label htmlFor="end-date" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  To
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-dark-border rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-elevated focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              
              <button 
                onClick={() => fetchTaskActivityFromFirebase()}
                className="px-4 py-2 mt-4 sm:mt-0 bg-transparent text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 w-full sm:w-auto"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {isLoadingActivityData ? (
            <div className="h-60 sm:h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500 border-r-2 border-b-2 border-gray-200 dark:border-dark-surface"></div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Total Task Calls</h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
                  </p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 rounded-md px-3 py-1 text-xs sm:text-sm font-medium self-start sm:self-auto">
                  {taskChartData.datasets[0].data.reduce((sum, curr) => sum + curr, 0).toLocaleString()} total calls
                </div>
              </div>
              
              <div className="h-60 sm:h-80">
                <Line 
                  data={taskChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(221, 79, 193, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                          }
                        }
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(160, 160, 160, 0.1)',
                        },
                        ticks: {
                          color: 'rgba(160, 160, 160, 0.8)',
                          font: {
                            size: 10,
                          },
                          maxTicksLimit: 6,
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: 'rgba(160, 160, 160, 0.8)',
                          font: {
                            size: 10,
                          },
                          maxTicksLimit: window.innerWidth < 640 ? 5 : 10,
                        }
                      }
                    },
                    elements: {
                      line: {
                        tension: 0.4,
                      },
                      point: {
                        radius: 2,
                        hoverRadius: 5,
                        backgroundColor: 'rgb(221, 79, 193)',
                        borderColor: 'white',
                      }
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-500 rounded-full mr-2 flex-shrink-0"></div>
            <span className="text-xs sm:text-sm">Task calls statistics reflect the total number of agent tasks initiated per day</span>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Dashboard;
