import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentCard from '../components/cards/AgentCard';
import PreBuiltAgents from '../components/cards/PreBuiltAgents';
import PrebuiltAgentList from '../components/cards/PrebuiltAgentList';
import { useAgents, usePreBuiltAgents } from '../hooks/useAgents';
import Navbar from '../components/layout/Navbar';
import LandingLayout from '../components/layout/LandingLayout';
import { AuthContext } from '../contexts/AuthContext';
import { SearchBar } from '../components/SearchBar';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPeopleGroup, faArrowRight, faLightbulb, faCode, faChartLine, faShieldAlt, faListUl, faThLarge, faBrain, faGlobe, faRocket } from '@fortawesome/free-solid-svg-icons';

// Custom animation styles
const animationStyles = `
  @keyframes float-animation {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
  
  @keyframes pulse-animation {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
  
  @keyframes bounce-animation {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow-animation {
    0%, 100% { box-shadow: 0 0 20px rgba(221, 79, 193, 0.4); }
    50% { box-shadow: 0 0 30px rgba(221, 79, 193, 0.7); }
  }
  
  @keyframes white-glow-animation {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
    50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.5); }
  }
  
  .animate-float-slow {
    animation: float-animation 8s ease-in-out infinite;
  }
  
  .animate-float-medium {
    animation: float-animation 6s ease-in-out infinite;
  }
  
  .animate-float-fast {
    animation: float-animation 4s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-animation 4s ease-in-out infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce-animation 3s ease-in-out infinite;
  }
  
  .animate-bounce-medium {
    animation: bounce-animation 2.5s ease-in-out infinite 0.2s;
  }
  
  .animate-bounce-fast {
    animation: bounce-animation 2s ease-in-out infinite 0.4s;
  }
  
  .animate-glow {
    animation: glow-animation 3s ease-in-out infinite;
  }
  
  .animate-white-glow {
    animation: white-glow-animation 3s ease-in-out infinite;
  }
`;

// Feature data - moved outside component to prevent recreation on render
const features = [
  {
    icon: faLightbulb,
    title: "Ready to Use",
    description: "Pre-built agents and teams that work out of the box for common use cases",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    bgDark: "bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400"
  },
  {
    icon: faCode,
    title: "Customizable",
    description: "Easily modify agents to fit your specific requirements and workflows",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    bgDark: "bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    icon: faChartLine,
    title: "Scalable",
    description: "From individual agents to complex teams, scale your AI solutions as you grow",
    color: "from-purple-500 to-indigo-600",
    bgLight: "bg-purple-50",
    bgDark: "bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400"
  },
  {
    icon: faShieldAlt,
    title: "Secure",
    description: "Enterprise-grade security with full control over your data and agents",
    color: "from-blue-500 to-cyan-600",
    bgLight: "bg-blue-50",
    bgDark: "bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400"
  }
];

function Landing() {
  // Use refs to store data fetched from API to prevent refetching
  const agentsData = useRef(null);
  const preBuiltAgentsData = useRef(null);
  const categoriesData = useRef(null);
  
  // Only fetch data if we don't already have it
  const { agents = [], categories = [] } = useAgents({
    onSuccess: (data) => {
      agentsData.current = data.agents || [];
      categoriesData.current = data.categories || [];
    },
    enabled: !agentsData.current // Only run the query if we don't have data
  });
  
  const { preBuiltAgents = {} } = usePreBuiltAgents({
    onSuccess: (data) => {
      preBuiltAgentsData.current = data.preBuiltAgents || {};
    },
    enabled: !preBuiltAgentsData.current // Only run the query if we don't have data
  });
  
  // Use the ref data if available, otherwise use the fetched data
  const currentAgents = agentsData.current || agents;
  const currentCategories = categoriesData.current || categories;
  const currentPreBuiltAgents = preBuiltAgentsData.current || preBuiltAgents;
  
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState('Smart Contract');
  const [activeSection, setActiveSection] = useState('agents'); // 'agents' or 'teams'
  const [teamViewType, setTeamViewType] = useState('cards'); // 'cards' or 'list'
  const [formattedTeams, setFormattedTeams] = useState([]);
  const [activeFeature, setActiveFeature] = useState(0);

  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filteredItems: filteredAgents
  } = useSearchFilter(currentAgents, ['name', 'description', 'category']);

  const displayedAgents = searchQuery 
    ? filteredAgents 
    : currentAgents.filter(agent => agent.category === activeCategory);

  // Memoize the setActiveFeature function to prevent unnecessary rerenders
  const handleFeatureClick = useCallback((index) => {
    setActiveFeature(index);
  }, []);

  // Ensure preBuiltAgents is properly formatted for the PreBuiltAgents component
  useEffect(() => {
    if (currentPreBuiltAgents) { 
      setFormattedTeams(currentPreBuiltAgents);
    }
  }, [currentPreBuiltAgents]);

  // Auto-rotate through features with useRef to prevent unnecessary rerenders
  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleAgentClick = useCallback((agent) => {
    navigate(`/explore?search=${encodeURIComponent(agent.name)}`);
  }, [navigate]);

  return (
    <LandingLayout>
      {/* Inject custom animation styles */}
      <style>{animationStyles}</style>
      
      <Navbar />
      
      {/* Hero Section - More dynamic with animated elements */}
      <div className="relative bg-white dark:bg-dark-bg overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-dark-bg sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Build intelligent agents with</span>{' '}
                  <span className="block text-primary-600 dark:text-primary-500 xl:inline">AI teammates</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Create, customize, and manage AI agents that work together to solve your most complex challenges
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get started
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button 
                      onClick={() => navigate('/features')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/40 md:py-4 md:text-lg md:px-10"
                    >
                      Learn more
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="py-16 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveSection('agents')}
                className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                  activeSection === 'agents'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-elevated'
                } border border-gray-200 dark:border-dark-border focus:z-10 focus:outline-none`}
              >
                <FontAwesomeIcon icon={faRobot} className="mr-2" />
                Single Agents
              </button>
              <button
                onClick={() => setActiveSection('teams')}
                className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                  activeSection === 'teams'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-elevated'
                } border border-gray-200 dark:border-dark-border focus:z-10 focus:outline-none`}
              >
                <FontAwesomeIcon icon={faPeopleGroup} className="mr-2" />
                Agent Teams
              </button>
            </div>
          </div>

          {/* Agents Section */}
          {activeSection === 'agents' && (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Individual AI Agents
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Specialized AI agents designed to excel at specific tasks
                </p>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {currentCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      activeCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-elevated'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
                placeholder="Search for an agent..."
              />

              {/* Agents Grid */}
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6`}>
                {displayedAgents.map((agent, index) => (
                  <div 
                    key={index}
                    onClick={() => handleAgentClick(agent)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <AgentCard agent={agent} />
                    {!isAuthenticated && (
                      <div className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                        Login required to select
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {searchQuery && filteredAgents.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No agents found matching your search.
                </div>
              )}

              <div className="text-center mt-12">
                <button
                  onClick={() => navigate('/explore')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  View All Agents
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Teams Section */}
          {activeSection === 'teams' && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Pre-built Agent Teams
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Deploy coordinated teams of AI agents designed to work together on complex tasks
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex justify-center mb-10">
                <div className="inline-flex rounded-md shadow-sm bg-white dark:bg-dark-surface p-1">
                  <button
                    onClick={() => setTeamViewType('cards')}
                    className={`px-6 py-3 text-sm font-medium rounded-lg flex items-center ${
                      teamViewType === 'cards'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-elevated'
                    } transition-all duration-200`}
                  >
                    <FontAwesomeIcon icon={faThLarge} className="mr-2" />
                    Card View
                  </button>
                  <button
                    onClick={() => setTeamViewType('list')}
                    className={`px-6 py-3 text-sm font-medium rounded-lg flex items-center ${
                      teamViewType === 'list'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-elevated'
                    } transition-all duration-200`}
                  >
                    <FontAwesomeIcon icon={faListUl} className="mr-2" />
                    List View
                  </button>
                </div>
              </div>

              {/* Teams Content */}
              <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-surface dark:to-dark-bg rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-dark-border">
                {/* Loading State */}
                {formattedTeams.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <FontAwesomeIcon icon={faPeopleGroup} className="text-primary-600 dark:text-primary-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Loading Teams</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md text-center">
                      We're preparing our pre-built agent teams for you. This should only take a moment...
                    </p>
                  </div>
                )}

                {/* Pre-built Teams - Card View */}
                {teamViewType === 'cards' && formattedTeams.length > 0 && (
                  <div>
                    {/* Group teams by category for PreBuiltAgents component */}
                    <PreBuiltAgents 
                      data={formattedTeams} 
                      onAgentClick={(team) => navigate(`/teams/${team.id || team.name}`)}
                    />
                  </div>
                )}

                {/* Pre-built Teams - List View */}
                {teamViewType === 'list' && formattedTeams.length > 0 && (
                  <PrebuiltAgentList preBuiltAgents={formattedTeams} />
                )}
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={() => navigate('/teams')}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                >
                  Explore All Teams
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section - Interactive with hover effects and animations */}
      <div className="py-12 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Build your AI team, your way
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Powerful tools to create and manage AI agents designed for your specific needs
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <div className={`absolute flex items-center justify-center h-12 w-12 rounded-md ${feature.bgLight} dark:${feature.bgDark} text-white`}>
                    <FontAwesomeIcon icon={feature.icon} className={feature.iconColor} />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your workflow with AI?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-3xl mx-auto">
            Start building your AI agent team today and unlock new levels of productivity and innovation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/signup')}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
              <FontAwesomeIcon icon={faRocket} className="ml-2" />
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center px-6 py-3 border border-white rounded-md shadow-sm text-base font-medium text-white bg-transparent hover:bg-primary-500 transition-colors duration-200"
            >
              Contact Sales
              <FontAwesomeIcon icon={faGlobe} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

export default Landing; 