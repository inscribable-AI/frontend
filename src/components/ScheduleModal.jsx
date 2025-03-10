import React, { useState } from 'react';
import { taskAPI } from '../services/api';
import { toast } from 'react-hot-toast';

export function ScheduleModal({ onClose, onSchedule, isSubmitting, teamId }) {
  const [formData, setFormData] = useState({
    taskMessage: '',
    description: '',
    scheduledTime: '',
    recurrenceEndTime: '',
    intervalValue: '1',
    intervalUnit: 'days',
    priority: 'medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert interval to milliseconds
    let recurrenceInterval = null;
    if (formData.intervalValue && formData.intervalUnit) {
      const value = parseInt(formData.intervalValue, 10);
      const unit = formData.intervalUnit;
      
      // Convert to milliseconds based on unit
      const MS_PER_MINUTE = 60 * 1000;
      const MS_PER_HOUR = 60 * MS_PER_MINUTE;
      const MS_PER_DAY = 24 * MS_PER_HOUR;
      const MS_PER_WEEK = 7 * MS_PER_DAY;
      
      switch (unit) {
        case 'minutes':
          recurrenceInterval = value * MS_PER_MINUTE;
          break;
        case 'hours':
          recurrenceInterval = value * MS_PER_HOUR;
          break;
        case 'days':
          recurrenceInterval = value * MS_PER_DAY;
          break;
        case 'weeks':
          recurrenceInterval = value * MS_PER_WEEK;
          break;
        default:
          recurrenceInterval = value * MS_PER_DAY; // Default to days
      }
    }
    
    const taskData = {
      agentId: teamId,
      taskMessage: formData.taskMessage,
      description: formData.description,
      scheduledTime: formData.scheduledTime,
      recurrenceInterval: recurrenceInterval,
      recurrenceEndTime: formData.recurrenceEndTime || null,
    };
    
    try {
      if (teamId) {
        await taskAPI.createTask(taskData);
        toast.success('Task scheduled successfully');
        onClose();
      } else {
        onSchedule(taskData);
      }
    } catch (error) {
      console.error('Error scheduling task:', error);
      toast.error('Failed to schedule task');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>
        
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Schedule Team Task
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set up a new scheduled task for the team
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Message
              </label>
              <input
                type="text"
                name="taskMessage"
                value={formData.taskMessage}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="datetime-local"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recurrence End Time
                </label>
                <input
                  type="datetime-local"
                  name="recurrenceEndTime"
                  value={formData.recurrenceEndTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recurrence Interval
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="intervalValue"
                    value={formData.intervalValue}
                    onChange={handleChange}
                    min="1"
                    className="w-20 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="intervalUnit"
                    value={formData.intervalUnit}
                    onChange={handleChange}
                    className="flex-1 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                } transition-colors`}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 