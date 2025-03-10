import { useState, useEffect } from 'react';
import { agentAPI } from '../services/api';

export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await agentAPI.getAllAgents();

        // Ensure we're working with an array
        const agentsArray = Array.isArray(response) ? response : response.data || [];

        // Transform each agent into the required format
        const transformedAgents = agentsArray.map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.classification.join(', '),
          logo: '🤖',
          beta: false,
          abilities: agent.classification,
          tools: agent.tools || [],
          // Format the category: remove spaces, underscores, and add spaces before capitals
          category: agent.category
            .replace(/\s+/g, '')
            .replace(/_/g, '')
            .replace(/([A-Z])/g, ' $1')
            .trim(),
          selectable: true,
          isSelected: false
        }));

        // Extract unique categories with the same formatting
        const uniqueCategories = [...new Set(transformedAgents.map(agent => agent.category))];

        setAgents(transformedAgents);
        setCategories(uniqueCategories);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return { 
    agents, 
    categories, 
    isLoading, 
    error,
    hasData: agents.length > 0 
  };
}

export function usePreBuiltAgents(options = {}) {
  const [preBuiltAgents, setPreBuiltAgents] = useState({});
  const [preBuiltCategories, setPreBuiltCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { onSuccess, enabled = true } = options || {};

  useEffect(() => {
    if (enabled === false) return;
    
    const fetchPreBuiltAgents = async () => {
      try {
        setIsLoading(true);
        const response = await agentAPI.getPreBuiltAgents();

        // Handle different response formats
        let agentsArray = response.data;
        if (response && response.data) {
          agentsArray = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
          agentsArray = response;
        }

        if (agentsArray.length === 0) {
          setPreBuiltAgents({});
          setPreBuiltCategories([]);
          if (onSuccess) {
            onSuccess({ preBuiltAgents: {}, preBuiltCategories: [] });
          }
          return;
        }

        // const transformedAgents = agentsArray.reduce((acc, agent) => {
        //   // Skip invalid agents
        //   if (!agent) return acc;
          
        //   // Safely handle category
        //   const categoryKey = agent.category ? agent.category.replace(/\s+/g, '') : 'Other';
          
        //   if (!acc[categoryKey]) {
        //     acc[categoryKey] = [];
        //   }
          
        //   // Create a safe description
        //   let description = '';
        //   if (agent.classification) {
        //     if (Array.isArray(agent.classification)) {
        //       description = agent.classification.join(', ');
        //     } else if (typeof agent.classification === 'string') {
        //       description = agent.classification;
        //     } else {
        //       description = String(agent.classification);
        //     }
        //   }
          
        //   acc[categoryKey].push({
        //     ...agent,
        //     description,
        //     logo: '🤖',
        //     beta: false
        //   });
          
        //   return acc;
        // }, {});


        const uniqueCategories = Object.keys(agentsArray);
        
        setPreBuiltAgents(agentsArray);
        setPreBuiltCategories(uniqueCategories);
        
        if (onSuccess) {
          onSuccess({ preBuiltAgents: agentsArray, preBuiltCategories: uniqueCategories });
        }
      } catch (error) {
        setError(error);
        
        // Set empty data on error to prevent UI issues
        setPreBuiltAgents({});
        setPreBuiltCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreBuiltAgents();
  }, [enabled, onSuccess]);

  return { preBuiltAgents, preBuiltCategories, isLoading, error };
} 


