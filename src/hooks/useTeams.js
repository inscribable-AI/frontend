import { useState, useCallback, useEffect } from 'react';
import { userAPI, agentV2API } from '../services/api';


export const useUserAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await agentV2API.getUserAgents();
      console.log("data", data);
      // Separate agents into tool agents and super agents
      const toolAgents = data.data.toolAgents;
      const superAgents = data.data.superAgents;
      
      // Set agents as object with separated arrays
      setAgents({
        toolAgents,
        superAgents
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.message || 'Failed to fetch agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  }, [agents]);

  return { agents, loading, error, fetchUserAgents };
};

export const useUserAgent = (agentId) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserAgent = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const response = await agentV2API.getUserAgentById(agentId);
      setAgent(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError(err.message || 'Failed to fetch team');
      setAgent(null);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchUserAgent();
  }, [fetchUserAgent]);

  return { agent, loading, error, fetchUserAgent };
}; 

export const useUserTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userAPI.getUserTeams();
      const teamsArray = Array.isArray(data.data) ? data.data : [];
      setTeams(teamsArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to fetch teams');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  }, [teams]);

  return { teams, loading, error, fetchTeams };
};

export const useUserTeam = (teamId) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeam = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const response = await userAPI.getUserTeamById(teamId);
      setTeam(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError(err.message || 'Failed to fetch team');
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { team, loading, error, fetchTeam };
}; 