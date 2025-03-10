import React, { useState, useEffect } from 'react';
import { ScheduleModal } from './ScheduleModal';
import { ScheduleTaskModal } from './modals/ScheduleTaskModal';
import { firebaseService } from '../services/firebaseService';
import { TablePagination } from './TablePagination';
import { taskAPI } from '../services/api'; // Import taskAPI
import { toast } from 'react-hot-toast';

// Define mockTasks array for testing without Fireb

export function TaskTable({ teamId }) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Collapsible state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(20); // Show 20 tasks per page when fetching
  const [lastTaskId, setLastTaskId] = useState(null);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  useEffect(() => {
    if (teamId) {
      // Reset states when teamId changes
      setTasks([]);
      setLastTaskId(null);
      setHasMoreTasks(true);
      setCurrentPage(1);
      fetchTasks();
    } 
  }, [teamId]);

  // Load more tasks when needed
  useEffect(() => {
    const totalNeeded = currentPage * tasksPerPage;
    if (totalNeeded > tasks.length && hasMoreTasks && !loading) {
      fetchTasks();
    }
  }, [currentPage]);

  const fetchTasks = async () => {
    if (loading || !hasMoreTasks) return;
    
    setLoading(true);
    setError(null);
    try {
      // Use getTaskByAgentId with tasksPerPage (20)
      const fetchedTasks = await firebaseService.getTaskByAgentId(teamId, tasksPerPage, lastTaskId);
      console.log("Fetched tasks:", fetchedTasks?.length);
      
      if (fetchedTasks && fetchedTasks.length > 0) {
        setTasks(prev => [...prev, ...fetchedTasks]);
        setLastTaskId(fetchedTasks[fetchedTasks.length - 1].id);
        setHasMoreTasks(fetchedTasks.length === tasksPerPage);
      } else {
        setHasMoreTasks(false);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Number of tasks to display based on collapse/expand state
  const displayTasksPerPage = isExpanded ? 20 : 10;

  // Pagination calculations based on display count
  const indexOfLastTask = currentPage * displayTasksPerPage;
  const indexOfFirstTask = indexOfLastTask - displayTasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  
  // Calculate total pages based on display count
  const totalPages = Math.max(
    Math.ceil(tasks.length / displayTasksPerPage),
    hasMoreTasks && currentPage >= Math.ceil(tasks.length / displayTasksPerPage) ? currentPage + 1 : currentPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Toggle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // If collapsing and on a page that would be out of bounds, reset to page 1
    if (isExpanded) {
      const newTotalPages = Math.ceil(tasks.length / 10);
      if (currentPage > newTotalPages) {
        setCurrentPage(1);
      }
    }
  };

  const handleScheduleTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      console.log("Scheduling task:", taskData);
      // Use taskAPI directly with unmodified taskData
      await taskAPI.createTask(taskData);
      
      toast.success('Task scheduled successfully');
      setIsScheduleModalOpen(false);
      fetchTasks(); // Refresh tasks after adding
    } catch (err) {
      console.error('Error scheduling task:', err);
      toast.error('Failed to schedule task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Tasks</h2>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-indigo-600 dark:border-indigo-400 text-sm leading-4 font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-transparent hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity"
        >
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Schedule Task
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Agent</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider flex justify-between items-center">
                  <span>Date</span>
                  <button 
                    onClick={toggleExpand} 
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {isExpanded ? (
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentTasks.length > 0 ? (
                currentTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {task.description || task.task || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'Completed' || task.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : task.status === 'In Progress' || task.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.agent || task.agentId || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.createdAt && task.createdAt.toDate 
                        ? task.createdAt.toDate().toLocaleDateString() 
                        : task.date 
                          ? new Date(task.date).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && tasks.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}

      {/* Add the TablePagination component if there are tasks */}
      {!loading && tasks.length > 0 && (
        <TablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={tasks.length + (hasMoreTasks ? "+" : "")}
          itemsPerPage={displayTasksPerPage}
          currentPageFirstItemIndex={indexOfFirstTask + 1}
          currentPageLastItemIndex={Math.min(indexOfLastTask, tasks.length)}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleModal
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={handleScheduleTask}
          isSubmitting={isSubmitting}
          teamId={teamId}
        />
      )}
    </div>
  );
} 