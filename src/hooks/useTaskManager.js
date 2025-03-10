import { useState, useCallback } from 'react';
import { firebaseService } from '../services/firebaseService';

/**
 * Custom hook for managing tasks
 * Provides methods for creating, fetching, updating, and deleting tasks
 * Handles loading and error states
 */
const useTaskManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get user tasks with pagination
  const getUserTasks = useCallback(async (userId, pageSize = 10, lastTaskId = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.getUserTasks(userId, pageSize, lastTaskId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
      setLoading(false);
      throw err;
    }
  }, []);

  // Get user task summary
  const getUserTaskSummary = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.getUserTaskSummary(userId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch task summary');
      setLoading(false);
      throw err;
    }
  }, []);

  // Get user scheduled tasks
  const getUserScheduledTasks = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.getUserScheduledTasks(userId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch scheduled tasks');
      setLoading(false);
      throw err;
    }
  }, []);

  // Get task by ID
  const getTaskById = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.getTaskById(taskId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch task');
      setLoading(false);
      throw err;
    }
  }, []);

  // Update scheduled task
  const updateScheduledTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.updateScheduledTask(taskId, taskData);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update task');
      setLoading(false);
      throw err;
    }
  }, []);

  // Delete scheduled task
  const deleteScheduledTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.deleteScheduledTask(taskId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      setLoading(false);
      throw err;
    }
  }, []);

  // Team-specific task methods
  const createTeamTask = useCallback(async (teamId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      // Adapt to firebase service by adding teamId to taskData
      const result = await firebaseService.createScheduledTask({
        ...taskData,
        teamId
      });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create team task');
      setLoading(false);
      throw err;
    }
  }, []);

  const getTeamTasks = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      // Get tasks by teamId using getUserTasks with teamId filter
      const result = await firebaseService.getTasksByTeamId(teamId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch team tasks');
      setLoading(false);
      throw err;
    }
  }, []);

  const updateTeamTask = useCallback(async (teamId, taskId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.updateScheduledTask(taskId, {
        ...taskData,
        teamId
      });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update team task');
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteTeamTask = useCallback(async (teamId, taskId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseService.deleteScheduledTask(taskId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to delete team task');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    // States
    loading,
    error,
    clearError,
    
    // User-specific task methods
    getUserTasks,
    getUserTaskSummary,
    getUserScheduledTasks,
    getTaskById,
    updateScheduledTask,
    deleteScheduledTask,
    
    // Team-specific task methods
    createTeamTask,
    getTeamTasks,
    updateTeamTask,
    deleteTeamTask,
  };
};

export default useTaskManager; 