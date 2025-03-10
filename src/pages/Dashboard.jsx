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
import { useUserTeams } from '../hooks/useTeams';
import ChartCard from '../components/charts/ChartCard';
import StatCard from '../components/stats/StatCard';
import { TablePagination } from '../components/TablePagination';
import {taskAPI} from '../services/api';
import { userAPI } from '../services/api';
import { firebaseService } from '../services/firebaseService';

// Register all necessary Chart.js components
ChartJS.register(...registerables);

function Dashboard() {
  const navigate = useNavigate();
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(15);
  
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
  
  const { teams = [], loading, error, fetchTeams } = useUserTeams();

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

  // Add function to fetch user ID
  const fetchUserId = async () => {
    try {
      // Option 1: Get user ID from API
      const userResponse = await userAPI.getUser();
      const id = userResponse.data.id || userResponse.data._id || userResponse.data.userId;
      console.log('Retrieved user ID:', id);
      setUserId(id);
      return id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      
      // Option 2: Try to get from localStorage if you store it there
      const storedId = localStorage.getItem('userId');
      if (storedId) {
        console.log('Using stored user ID:', storedId);
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
    console.log('Fetching teams...');
    fetchTeams();
  }, [fetchTeams]);

  // Add a separate useEffect to fetch task summary
  useEffect(() => {
    console.log('Fetching task summary...');
    fetchTaskSummary();
  }, []); // Empty dependency array means run once on mount

  // Get current teams for pagination
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = Array.isArray(teams) ? teams.slice(indexOfFirstTeam, indexOfLastTeam) : [];

  const totalPages = Math.ceil((Array.isArray(teams) ? teams.length : 0) / teamsPerPage);

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
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
  const totalTeams = Array.isArray(teams) ? teams.length : 0;

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
      
      console.log('Fetching task activity for user:', id);
      
      // Call the Firebase method
      const activityData = await firebaseService.getUserTaskActivityByDateRange(
        id, 
        startDate, 
        endDate
      );
      
      console.log('Task activity data:', activityData);
      
      // Transform the data for the chart
      if (activityData.length > 0) {
        const labels = activityData.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const values = activityData.map(item => item.count);
        
        // Update chart data
        setTaskChartData({
          labels,
          datasets: [
            {
              label: 'Task Calls',
              data: values,
              borderColor: 'rgb(37, 99, 235)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
              borderColor: 'rgb(37, 99, 235)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
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

  return (
    <PageWrapper>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage all your Agents and Teams here</p>
      </div>

      {/* Stats Grid - Updated to match exact API response */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="active teams" 
          value={loading ? "..." : totalTeams.toString()}
        />
        
        <StatCard 
          title="tasks completed" 
          value={isLoadingTaskSummary ? "..." : taskSummary.totalCompleted.toString()}
        />
        
        <StatCard 
          title="average response time" 
          value={isLoadingTaskSummary ? "..." : `${Math.round(taskSummary.averageProcessingTime / 1000)}s`}
        />
      </div>

      {/* Chart Section with Improved Date Filter and Presets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-0">
                Task Calls
              </h3>
              
              {/* Date range presets */}
              <div className="flex space-x-2 mb-4 md:mb-0">
                <button 
                  onClick={() => setDateRange(7)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Last 7 days
                </button>
                <button 
                  onClick={() => setDateRange(30)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Last 30 days
                </button>
                <button 
                  onClick={() => setDateRange(90)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Last 90 days
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative md:w-48">
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
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="relative md:w-48">
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
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <button 
                onClick={() => setTaskChartData(generateChartData())}
                className="px-4 py-2 bg-transparent text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
        
        <ChartCard 
          title="Total Task Calls" 
          period={`${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`}
          data={taskChartData}
          height={400}
          className="rounded-t-none"
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      // Format as number instead of currency
                      label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                    }
                    
                    // Add percentage change if available
                    const dataIndex = context.dataIndex;
                    if (dataIndex > 0) {
                      const currentValue = context.parsed.y;
                      const previousValue = context.dataset.data[dataIndex - 1];
                      const percentChange = ((currentValue - previousValue) / previousValue) * 100;
                      
                      if (!isNaN(percentChange)) {
                        const sign = percentChange >= 0 ? '+' : '';
                        label += ` ${sign}${percentChange.toFixed(1)}%`;
                      }
                    }
                    
                    return label;
                  }
                }
              }
            }
          }}
        />
      </div>

      {/* Updated Teams Table Section */}
      <div id="teams" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Teams</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Array.isArray(teams) ? teams.length : 0} teams
            </span>
            <button
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
        
        <div className={`transition-all duration-300 ${isTableExpanded ? 'h-[800px]' : 'h-[400px]'}`}>
          <div className="h-full flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : teams.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No teams found
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <div className="min-w-full">
                  <div className="sticky top-0 z-10 grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <div>Team ID</div>
                    <div>Name</div>
                    <div>Members</div>
                    <div>Type</div>
                    <div>Created At</div>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentTeams.map((team) => (
                      <div 
                        key={team.id} 
                        className="grid grid-cols-5 gap-4 px-6 py-4 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => navigate(`/dashboard/team/${team.id}`)}
                      >
                        <div className="text-gray-500 dark:text-gray-400 font-mono">
                          {team.id.substring(0, 8)}...
                        </div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {team.name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 3).map((member, index) => (
                              <div
                                key={member.id}
                                className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
                                title={member.name}
                              >
                                <span className="text-xs text-blue-600 dark:text-blue-200">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                            ))}
                            {team.members.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                                <span className="text-xs text-gray-600 dark:text-gray-200">
                                  +{team.members.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${team.provisionType === 1 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                            {team.provisionType === 1 ? 'Manual' : 'Auto'}
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {formatDate(team.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Replace the pagination section with the component */}
            <TablePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
              totalItems={Array.isArray(teams) ? teams.length : 0}
              itemsPerPage={teamsPerPage}
              currentPageFirstItemIndex={indexOfFirstTeam}
              currentPageLastItemIndex={indexOfLastTeam}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Dashboard;
