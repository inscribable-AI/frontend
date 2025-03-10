import React, { useEffect, useState } from 'react';

export function TeamStats({ agents, tasks }) {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    avgTasksPerAgent: 0,
    completionRate: 0,
    mostProductiveAgent: null,
    recentActivity: false
  });

  useEffect(() => {
    if (!agents || !tasks) return;

    // Calculate basic stats
    const totalAgents = agents.length;
    
    // Consider an agent active if they have tasks assigned in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Create a map of agent IDs to their assigned tasks
    const agentTaskMap = {};
    agents.forEach(agent => {
      agentTaskMap[agent.id] = {
        name: agent.name || agent.id,
        taskCount: 0,
        completedTasks: 0,
        hasRecentTask: false
      };
    });
    
    // Count tasks for each agent
    tasks.forEach(task => {
      const agentId = task.agentId || task.agent;
      if (agentId && agentTaskMap[agentId]) {
        agentTaskMap[agentId].taskCount++;
        
        // Check if task is completed
        const status = task.status ? task.status.toLowerCase() : '';
        if (status === 'completed' || status === 'complete') {
          agentTaskMap[agentId].completedTasks++;
        }
        
        // Check if task was created/updated recently
        let taskDate = null;
        if (task.createdAt && task.createdAt.toDate) {
          taskDate = task.createdAt.toDate();
        } else if (task.date) {
          taskDate = new Date(task.date);
        }
        
        if (taskDate && taskDate > sevenDaysAgo) {
          agentTaskMap[agentId].hasRecentTask = true;
        }
      }
    });
    
    // Count active agents (those with recent tasks)
    const activeAgents = Object.values(agentTaskMap).filter(
      agent => agent.hasRecentTask
    ).length;
    
    // Find most productive agent (most completed tasks)
    let mostProductiveAgent = null;
    let maxCompletedTasks = 0;
    
    Object.entries(agentTaskMap).forEach(([id, data]) => {
      if (data.completedTasks > maxCompletedTasks) {
        maxCompletedTasks = data.completedTasks;
        mostProductiveAgent = {
          id,
          name: data.name,
          completedTasks: data.completedTasks
        };
      }
    });
    
    // Calculate average tasks per agent
    const avgTasksPerAgent = totalAgents > 0 
      ? Math.round((tasks.length / totalAgents) * 10) / 10 
      : 0;
    
    // Calculate task completion rate
    const completedTasks = tasks.filter(task => {
      const status = task.status ? task.status.toLowerCase() : '';
      return status === 'completed' || status === 'complete';
    }).length;
    
    const completionRate = tasks.length > 0 
      ? Math.round((completedTasks / tasks.length) * 100) 
      : 0;
    
    // Check for recent activity (any task in last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentActivity = tasks.some(task => {
      let taskDate = null;
      if (task.createdAt && task.createdAt.toDate) {
        taskDate = task.createdAt.toDate();
      } else if (task.updatedAt && task.updatedAt.toDate) {
        taskDate = task.updatedAt.toDate();
      } else if (task.date) {
        taskDate = new Date(task.date);
      }
      return taskDate && taskDate > oneDayAgo;
    });
    
    setStats({
      totalAgents,
      activeAgents,
      avgTasksPerAgent,
      completionRate,
      mostProductiveAgent,
      recentActivity
    });
    
  }, [agents, tasks]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          Team Analytics
        </h3>
        {stats.recentActivity && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <span className="flex h-2 w-2 relative mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Active Today
          </span>
        )}
      </div>
      
      {/* Main stats grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Agents Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Agents</p>
              <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAgents}</h4>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">{stats.activeAgents} Active (7d)</span>
            <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
              {stats.totalAgents > 0 ? Math.round((stats.activeAgents / stats.totalAgents) * 100) : 0}%
            </span>
          </div>
        </div>
        
        {/* Task Completion Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Rate</p>
              <h4 className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{stats.completionRate}%</h4>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-green-600 dark:text-green-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div 
                className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Tasks Per Agent Card */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasks Per Agent</p>
              <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.avgTasksPerAgent}</h4>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">Total Tasks:</span>
            <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">{tasks.length}</span>
          </div>
        </div>
        
        {/* Top Performer Card */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="z-10 relative">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Top Performer</p>
            {stats.mostProductiveAgent ? (
              <div className="mt-2 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-700 flex items-center justify-center shadow-sm">
                    <span className="text-amber-700 dark:text-amber-200 text-lg font-semibold">
                      {stats.mostProductiveAgent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {stats.mostProductiveAgent.name}
                  </p>
                  <div className="flex items-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-medium ml-1 text-gray-600 dark:text-gray-300">
                      {stats.mostProductiveAgent.completedTasks} tasks completed
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                No performance data yet
              </div>
            )}
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 dark:opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>Statistics based on {tasks.length} tasks and {agents.length} agents</span>
        <span className="text-indigo-500 dark:text-indigo-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
} 