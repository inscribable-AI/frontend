import React, { useEffect, useState } from 'react';

export function TaskSummary({ tasks }) {
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setSummary({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        failed: 0
      });
      return;
    }

    const newSummary = {
      total: tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0
    };

    tasks.forEach(task => {
      const status = task.status ? task.status.toLowerCase() : 'pending';
      
      if (status === 'completed' || status === 'complete') {
        newSummary.completed++;
      } else if (status === 'in progress' || status === 'processing' || status === 'running') {
        newSummary.inProgress++;
      } else if (status === 'failed' || status === 'error') {
        newSummary.failed++;
      } else {
        newSummary.pending++;
      }
    });

    setSummary(newSummary);
  }, [tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inProgress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const calculatePercentage = (value) => {
    if (summary.total === 0) return 0;
    return Math.round((value / summary.total) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</h4>
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</span>
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h4>
            <span className={`text-2xl font-semibold ${getStatusColor('completed')}`}>{summary.completed}</span>
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h4>
            <span className={`text-2xl font-semibold ${getStatusColor('inProgress')}`}>{summary.inProgress}</span>
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h4>
            <span className={`text-2xl font-semibold ${getStatusColor('pending')}`}>{summary.pending}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{calculatePercentage(summary.completed)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(summary.completed)}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{calculatePercentage(summary.inProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-yellow-400 dark:bg-yellow-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(summary.inProgress)}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{calculatePercentage(summary.pending)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-500 dark:bg-blue-600 h-2.5 rounded-full" style={{ width: `${calculatePercentage(summary.pending)}%` }}></div>
          </div>
        </div>
        
        {summary.failed > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{calculatePercentage(summary.failed)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-red-500 dark:bg-red-600 h-2.5 rounded-full" style={{ width: `${calculatePercentage(summary.failed)}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 