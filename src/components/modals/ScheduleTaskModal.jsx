import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { taskAPI, agentAPI } from '../../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';

export function ScheduleTaskModal({ isOpen, onClose, teamId }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agentId: '',
    taskMessage: '',
    description: '',
    scheduledTime: new Date(),
    recurrenceInterval: 'none', // none, daily, weekly, monthly
    recurrenceEndTime: null
  });

  // Fetch available agents when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    try {
      const agentsData = await agentAPI.getAllAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleRecurrenceChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      recurrenceInterval: value,
      // Reset end time if recurrence is 'none'
      recurrenceEndTime: value === 'none' ? null : prev.recurrenceEndTime
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the task data
      const taskData = {
        agentId: formData.agentId,
        taskMessage: formData.taskMessage,
        description: formData.description,
        scheduledTime: formData.scheduledTime.toISOString(),
        recurrenceInterval: formData.recurrenceInterval === 'none' ? null : formData.recurrenceInterval,
        recurrenceEndTime: formData.recurrenceEndTime ? formData.recurrenceEndTime.toISOString() : null
      };

      // Call the API to create the task
      await taskAPI.createTask(teamId, taskData);
      
      toast.success('Task scheduled successfully');
      onClose();
      
      // Reset form
      setFormData({
        agentId: '',
        taskMessage: '',
        description: '',
        scheduledTime: new Date(),
        recurrenceInterval: 'none',
        recurrenceEndTime: null
      });
    } catch (error) {
      console.error('Error scheduling task:', error);
      toast.error('Failed to schedule task');
    } finally {
      setLoading(false);
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-auto p-6 shadow-xl">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Schedule a Task
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Agent
            </label>
            <select
              id="agentId"
              name="agentId"
              value={formData.agentId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-sm"
            >
              <option value="">Select an agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="taskMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Message
            </label>
            <textarea
              id="taskMessage"
              name="taskMessage"
              rows={3}
              value={formData.taskMessage}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-sm"
              placeholder="What would you like the agent to do?"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-sm"
              placeholder="Add additional details about this task"
            />
          </div>
          
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Scheduled Time
            </label>
            <DatePicker
              selected={formData.scheduledTime}
              onChange={(date) => handleDateChange(date, 'scheduledTime')}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recurrence
            </label>
            <select
              id="recurrenceInterval"
              name="recurrenceInterval"
              value={formData.recurrenceInterval}
              onChange={handleRecurrenceChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-sm"
            >
              <option value="none">No recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          {formData.recurrenceInterval !== 'none' && (
            <div>
              <label htmlFor="recurrenceEndTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurrence End Date (optional)
              </label>
              <DatePicker
                selected={formData.recurrenceEndTime}
                onChange={(date) => handleDateChange(date, 'recurrenceEndTime')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white text-sm"
                placeholderText="Select end date (optional)"
              />
            </div>
          )}
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Scheduling...' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 