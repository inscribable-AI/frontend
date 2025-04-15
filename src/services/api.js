import axios from 'axios';
//import { API_URL } from '../config';

// Create axios instance with default config
const api = axios.create({
  // baseURL will be set according to your environment
  baseURL: import.meta.env.VITE_API_URL /*|| "https://api-production-9e14.up.railway.app/api"*/,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth headers etc.
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('jwt'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response?.status === 401 || 
        error.response?.data?.message === 'Invalid token' || 
        error.response?.data?.message === 'Token expired' || 
        error.response?.data?.message === 'Unauthorized') {
      
      // Clear the token from localStorage
      localStorage.removeItem('jwt');
      
      // Dispatch a custom event for handling auth errors
      window.dispatchEvent(new CustomEvent('auth:expired', {
        detail: { message: 'Your session has expired. Please sign in again.' }
      }));
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Auth related API calls
export const authAPI = {
  signIn: async (credentials) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },

  signUp: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  verifyOTP: async (otp, email) => {
    const response = await api.post('/auth/verify-otp', { 
      otp,
      email 
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  signOut: async (token) => {
    try {
      const response = await api.post('/auth/signout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.message;
    } catch (error) {
      console.error('Error signing out:', error.response?.data?.message || error.message);
    }
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

// Team related API calls
export const teamAPI = {
  createTeam: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  getTeamById: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  updateTeam: async (teamId, teamData) => {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  deleteTeam: async (teamId) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
  },

  addAgentsToTeam: async (teamId, agents) => {
    const response = await api.post(`/teams/${teamId}/agents`, { agents });
    return response.data;
  },

  removeAgentFromTeam: async (teamId, agentId) => {
    const response = await api.delete(`/teams/${teamId}/agents/${agentId}`);
    return response.data;
  },

  getUserTeams: async () => {
    const response = await api.get('/teams');
    return response.data;
  },
};

// Agent related API calls
export const agentAPI = {
  getAgents: async (category) => {
    const response = await api.get('/agents', { params: { category } });
    return response.data;
  },

  getPreBuiltAgents: async () => {
    const response = await api.get('/features/get-all-prebuilt-agents');
    return response.data;
  },

  getAllAgents: async () => {
    const response = await api.get('/features/get-all-agents', { params: {} });
    return response.data;
  },

  getAgentById: async (agentId) => {
    const response = await api.get(`/agents/${agentId}`);
    return response.data;
  },

  updateAgentCredentials: async (agentId, credentials) => {
    const response = await api.put(`/agents/${agentId}/credentials`, credentials);
    return response.data;
  },

  getAgentCategories: async () => {
    const response = await api.get('/agents/categories');
    return response.data;
  },

  recruitNewAgents: async (teamData) => {
    const response = await api.post('/features/recruit-new-agents', teamData);
    return response.data;
  },

  recruitToTeam: async (teamId, agentIds) => {
    const response = await api.post('/features/recruit-to-team', {
      teamId,
      agentIds
    });
    return response.data;
  },

  updateTeamName: async (teamId, name) => {
    const response = await api.post('/features/update-team-name', {
      teamId,
      name
    });
    return response.data;
  },
};

//user related API calls
export const userAPI = {
  getUserTeams: async () => {
    const response = await api.get('/features/get-user-teams');
    return response.data;
  },

  getUserTeamById: async (teamId) => {
    const response = await api.get(`/features/get-user-team-by-id/${teamId}`);
    return response.data;
  },

  getUser: async () => {
    const response = await api.get(`/features/get-user`);
    return response.data;
  },

  getUserCredentials: async () => {
    const response = await api.get(`/features/get-user-credentials`);
    return response.data;
  },

  storeUserCredential: async (credentialData) => {
    const response = await api.post(`/features/store-user-credentials`, {
      key: credentialData.key,
      name: credentialData.name,
      value: credentialData.secret
    });
    return response.data;
  },

  updateUserCredential: async (credentialData) => {
    const response = await api.post(`/features/update-user-credentials`, {
      key: credentialData.key,
      name: credentialData.name,
      value: credentialData.secret
    });
    return response.data;
  },

  deleteUserCredential: async (credentialData) => {
    const response = await api.delete(`/features/delete-user-credentials`, {
      data: credentialData
    });
    return response.data;
  },
};

// Task related API calls
export const taskAPI = {
  createTask: async (taskData) => {
    const response = await api.post(`/tasks/new`, taskData);
    return response.data;
  },

  getTeamTasks: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/tasks`);
    return response.data;
  },

  updateTask: async (teamId, taskId, taskData) => {
    const response = await api.put(`/teams/${teamId}/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (teamId, taskId) => {
    const response = await api.delete(`/teams/${teamId}/tasks/${taskId}`);
    return response.data;
  },
  
  // New methods based on the task controller
  createScheduledTask: async (taskData) => {
    const response = await api.post('/tasks/scheduled', taskData);
    return response.data;
  },
  
  getUserTasks: async (pageSize, lastTaskId) => {
    const params = { pageSize };
    if (lastTaskId) params.lastTaskId = lastTaskId;
    const response = await api.get('/tasks', { params });
    return response.data;
  },
  
  getUserTaskSummary: async () => {
    const response = await api.get('/tasks/user/summary');
    return response.data;
  },
  
  getUserScheduledTasks: async () => {
    const response = await api.get('/tasks/scheduled');
    return response.data;
  },
  
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/scheduled/${taskId}`);
    return response.data;
  },
  
  updateScheduledTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/scheduled/${taskId}`, taskData);
    return response.data;
  },
  
  deleteScheduledTask: async (taskId) => {
    const response = await api.delete(`/tasks/scheduled/${taskId}`);
    return response.data;
  },
  
  sendMessage: async (messageData) => {
    const response = await api.post('/tasks/message', messageData);
    return response.data;
  },

  // getTaskActivity: async (startDate, endDate) => {
  //   const response = await api.get('/tasks/activity', {
  //     params: { startDate, endDate }
  //   });
  //   return response.data;
  // },
};

// Tool related API calls
export const toolAPI = {
  getTools: async () => {
    const response = await api.get('/features/get-tools');
    return response.data;
  },
  getToolById: async (toolId) => {
    const response = await api.get(`/features/get-tool-by-id/${toolId}`);
    return response.data;
  },
};

export const agentV2API = {
  /**
   * Creates a new Tool Agent or Super Agent
   * @param {Object} agentData - The agent data object
   * @param {string} agentData.name - Name of the agent
   * @param {string} agentData.description - Description of the agent
   * @param {Array} [agentData.tools] - Array of tools (required for Tool Agent)
   * @param {Array} [agentData.toolAgents] - Array of tool agent IDs (required for Super Agent)
   * @param {string} [agentData.prompt] - Custom prompt (optional for Tool Agent)
   * @param {string} [agentData.character] - Character style for prompt generation (optional for Tool Agent)
   */
  createAgent: async (agentData) => {
    const response = await api.post('/features/create-agent', agentData);
    return response.data;
  },
  
  /**
   * Updates an existing Tool Agent or Super Agent
   * @param {string} agentId - ID of the agent to update
   * @param {Object} agentData - The agent data object with fields to update
   * @param {string} [agentData.name] - Updated name
   * @param {string} [agentData.description] - Updated description
   * @param {Array} [agentData.tools] - Updated tools array (for Tool Agent)
   * @param {Array} [agentData.toolAgents] - Updated tool agents array (for Super Agent)
   * @param {string} [agentData.prompt] - Updated custom prompt (for Tool Agent)
   */
  updateAgent: async (agentId, agentData) => {
    const response = await api.post('/features/update-agent', {
      agentId,
      ...agentData
    });
    return response.data;
  },
  
  /**
   * Deletes an agent by ID
   * @param {string} agentId - ID of the agent to delete
   */
  deleteAgent: async (agentId) => {
    const response = await api.delete('/features/delete-agent', {
      data: { agentId }
    });
    return response.data;
  },
  
  /**
   * Fetches all agents (both tool agents and super agents) for the authenticated user
   * @returns {Object} Object containing arrays of toolAgents and superAgents
   */
  getUserAgents: async () => {
    const response = await api.get('/features/get-user-agents');
    return response.data;
  },

  /**
   * Fetches a specific agent by ID
   * @param {string} agentId - ID of the agent to fetch
   * @returns {Object} The agent object
   */
  getUserAgentById: async (agentId) => {
    const response = await api.get(`/features/get-user-agent-by-id/${agentId}`);
    return response.data;
  },

  /**
   * Creates a new Tool Agent
   * @param {Object} agentData - The agent creation data
   * @param {string} agentData.name - Name of the agent
   * @param {string} agentData.description - Description of the agent
   * @param {Array} agentData.tools - Array of tools to assign to the agent
   * @param {object} agentData.character - Character/personality of the agent
   * @returns {string} The created agent prompt
   */  
  createAgentPrompt: async (promptData) => {
    const response = await api.post('/features/create-prompt', promptData);
    return response.data;
  },  
};

export default api; 