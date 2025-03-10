import { useState, useCallback, useEffect } from 'react';
import { userAPI } from '../services/api';

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
    console.log('Teams state updated:', teams);
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