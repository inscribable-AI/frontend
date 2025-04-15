import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAgents } from '../hooks/useAgents';
import axios from 'axios'; // Make sure to install axios
import { Fragment } from 'react';
import { Listbox, ListboxOption, Transition, Dialog } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useUserTeam } from '../hooks/useTeams';
import { TeamStats } from '../components/TeamStats';
import { TeamMembersTable } from '../components/TeamMembersTable';
import { TaskTable } from '../components/TaskTable';
import { TablePagination } from '../components/TablePagination';
import { ChatSection } from '../components/ChatSection';
import { TaskSummary } from '../components/TaskSummary';
import { firebaseService } from '../services/firebaseService';

function CustomSelect({ value, onChange, options, label, id, error }) {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className={`relative w-full cursor-default rounded-lg border ${
            error ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
          } bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm`}>
            <span className="block truncate text-gray-900 dark:text-white">
              {options.find(opt => opt.value === value)?.label || `Select ${label.toLowerCase()}`}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active 
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' 
                        : 'text-gray-900 dark:text-white'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'} text-gray-900 dark:text-white`}>
                        {option.label}
                      </span>
                      {selected ? (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}

function EditAgentModal({ agent, onClose, onSave, isSubmitting }) {
  // Initialize form data directly from agent's structure
  const [formData, setFormData] = useState({
    credentials: agent.credentials || {},
    attributes: agent.attributes || {}
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required credentials
    Object.entries(formData.credentials).forEach(([key, field]) => {
      if (field.required && !field.value?.trim()) {
        newErrors[`credentials.${key}`] = `${field.label} is required`;
      }
    });
    
    // Validate required attributes
    Object.entries(formData.attributes).forEach(([key, field]) => {
      if (field.required && !field.value?.trim()) {
        newErrors[`attributes.${key}`] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          ...prev[section][key],
          value: value
        }
      }
    }));

    // Clear error when user starts typing
    if (errors[`${section}.${key}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${key}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };


  const renderField = (section, key, field) => {
    const baseFieldClasses = "w-full h-[38px] px-4 py-2 rounded-lg border transition-all duration-200 ease-in-out";
    const fieldColors = `${
      errors[`${section}.${key}`] 
        ? 'border-red-300 focus:border-red-500' 
        : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`;

    if (field.type === 'select') {
      return (
        <div className="h-[38px]">
          <CustomSelect
            id={`${section}-${key}`}
            value={field.value || ""}
            onChange={(value) => handleChange(section, key, value)}
            options={field.options || []}
            label={field.label}
            error={errors[`${section}.${key}`]}
          />
        </div>
      );
    }

    return (
      <input
        type={field.type || (section === 'credentials' ? "password" : "text")}
        id={`${section}-${key}`}
        value={field.value || ""}
        onChange={(e) => handleChange(section, key, e.target.value)}
        className={`${baseFieldClasses} ${fieldColors} focus:outline-none focus:ring-0`}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    );
  };

  const renderSection = (title, section, icon) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-y-4">
        {Object.entries(formData[section]).map(([key, field]) => (
          <div key={key} className="w-full">
            <label 
              htmlFor={`${section}-${key}`} 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(section, key, field)}
            {errors[`${section}.${key}`] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors[`${section}.${key}`]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>
        
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl p-6">
          {/* Header with fixed dark mode colors */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Agent Details
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update agent credentials and attributes
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Credentials Section */}
            {renderSection(
              "Credentials",
              "credentials",
              <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}

            {/* Attributes Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {renderSection(
                "Attributes",
                "attributes",
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TeamOverview() {
  const { teamId } = useParams();
  const { team } = useUserTeam(teamId);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  
  // Default to collapsed on mobile, expanded on desktop
  const [isChatCollapsed, setIsChatCollapsed] = useState(window.innerWidth < 768);
  
  // Listen for window resize to collapse chat on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isChatCollapsed) {
        setIsChatCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isChatCollapsed]);

  useEffect(() => {
    const fetchTeamData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (team) {
          setTeamData(team);
          setAgents(team.members || []);
          
          // Fetch tasks for the team with pagination - use membersPerPage instead of hardcoded value
          if (team.id) {
            const fetchedTasks = await firebaseService.getTaskByAgentId(team.id, membersPerPage, null);
            setTasks(fetchedTasks || []);
          }
        }
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [team]);

  const totalPages = Math.ceil(agents.length / membersPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleEditAgent = (agent) => {
    console.log('Edit agent:', agent);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center p-4">{error}</div>
    );
  }

  return (
    <div className="flex">
      <div className={`flex-1 p-6 ${isChatCollapsed ? 'mr-0 md:mr-[50px]' : 'mr-0 md:mr-[400px]'}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {teamData?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Team ID: {teamData?.id}
          </p>
        </div>

        {/* Add Task Summary */}
        {/* <TaskSummary tasks={tasks} /> */}

        <TeamStats 
          agents={agents} 
          tasks={tasks}
        />

        <div className="mt-8">
          <TeamMembersTable 
            members={agents}
            currentPage={currentPage}
            membersPerPage={membersPerPage}
            handleEditAgent={handleEditAgent}
          />
          
          {totalPages > 1 && (
            <TablePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
        
        <TaskTable teamId={teamData?.id} />
      </div>

      {/* Mobile optimized chat section */}
      <div className={`fixed inset-0 md:inset-auto md:right-0 md:top-0 md:h-screen z-50 transition-transform duration-300 ${
        isChatCollapsed ? 'translate-x-full md:translate-x-[calc(100%-50px)]' : 'translate-x-0'
      }`}>
        <ChatSection 
          team={teamData}
          isCollapsed={isChatCollapsed}
          onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
        />
      </div>
      
      {/* Chat toggle button for mobile - only visible when collapsed */}
      {isChatCollapsed && (
        <button 
          onClick={() => setIsChatCollapsed(false)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg z-40 md:hidden"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default TeamOverview; 