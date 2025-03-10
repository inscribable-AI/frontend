import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faTools, faArrowRight, faUserGroup, faUsers, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

const PrebuiltAgentList = ({ preBuiltAgents }) => {
  const navigate = useNavigate();

  const handleTeamClick = (team) => {
    navigate(`/teams?category=${encodeURIComponent(team.category)}`);
  };

  // Group agents by category
  const groupedAgents = preBuiltAgents.reduce((acc, team) => {
    if (!acc[team.category]) {
      acc[team.category] = [];
    }
    acc[team.category].push(team);
    return acc;
  }, {});

  // If no agents, show a placeholder
  if (Object.keys(groupedAgents).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <FontAwesomeIcon icon={faUserGroup} className="text-blue-600 dark:text-blue-400 text-2xl" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Teams Available</h3>
        <p className="text-gray-500 dark:text-gray-400">Check back later for pre-built agent teams.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(groupedAgents).map(([category, teams]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-sm">
                <FontAwesomeIcon icon={faLayerGroup} className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category} Teams
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {teams.length} pre-built agent {teams.length === 1 ? 'team' : 'teams'} for {category.toLowerCase()} tasks
                </p>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {teams.map((team) => (
              <div 
                key={team.name}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => handleTeamClick(team)}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faUserGroup} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                          {team.name}
                          {team.isNew && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                              New
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faUsers} className="mr-1" />
                          {team.members.length} agents
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {team.members.slice(0, 3).map((member, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-3 shadow-sm">
                            <FontAwesomeIcon icon={faRobot} className="text-white text-sm" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <FontAwesomeIcon icon={faTools} className="mr-1" />
                              {member.tools.length} tools
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {team.members.length > 3 && (
                      <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
                        +{team.members.length - 3} more agents
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 self-center">
                    <div className="rounded-full p-2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-750 p-4 text-center">
            <button
              onClick={() => navigate(`/teams?category=${encodeURIComponent(category)}`)}
              className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              View all {category} teams
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

PrebuiltAgentList.propTypes = {
  preBuiltAgents: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      classification: PropTypes.arrayOf(PropTypes.string).isRequired,
      tools: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        credentials: PropTypes.any
      })).isRequired
    })).isRequired
  })).isRequired
};

export default PrebuiltAgentList; 