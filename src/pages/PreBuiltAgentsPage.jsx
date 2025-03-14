import { useEffect, useState } from 'react';
import PreBuiltAgents from '../components/cards/PreBuiltAgents';
import { agentAPI } from '../services/api';
import { SearchBar } from '../components/SearchBar';

const PreBuiltAgentsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentData, setAgentData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // Default view mode

  useEffect(() => {
    const fetchPreBuiltAgents = async () => {
      try {
        setIsLoading(true);
        const response = await agentAPI.getPreBuiltAgents();
        setAgentData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Detailed error:', err);
        setError('Failed to load pre-built agents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreBuiltAgents();
  }, []);

  const totalTeams = agentData.length;
  const totalAgents = agentData.reduce((sum, team) => sum + team.members.length, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Pre-Built Teams
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Specialized teams of AI agents working together to accomplish complex tasks efficiently.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalTeams} teams available with {totalAgents} specialized agents, each fine-tuned for specific roles and responsibilities within their teams.
          </p>
        </div>

        {/* Search - Replaced with SearchBar component */}
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          placeholder="Search teams..."
          showViewToggle={true}
        />

        {/* Content */}
        <PreBuiltAgents data={agentData} viewMode={viewMode} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default PreBuiltAgentsPage; 