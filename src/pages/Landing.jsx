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
    0%, 100% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.4); }
    50% { box-shadow: 0 0 30px rgba(79, 70, 229, 0.7); }
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
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-black overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
        
        {/* Animated floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-medium"></div>
          <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-float-fast"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 p-2 bg-white/10 backdrop-blur-lg rounded-full animate-pulse-slow">
            <div className="px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <span className="text-sm font-medium text-white">New: Team Collaboration Features</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Deploy AI Agents & Teams <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">in Minutes</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Build, customize, and deploy powerful AI solutions with our pre-built agents and teams
          </p>
          
          {/* Single CTA button - Different styles based on authentication */}
          <div className="flex justify-center">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="group px-10 py-4 text-lg font-bold rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden animate-white-glow"
              >
                <span className="absolute inset-0 w-full h-full bg-gray-200/30 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                <span className="relative z-10 flex items-center justify-center">
                  Go to Dashboard
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/signup')}
                className="group px-10 py-4 text-lg font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden animate-glow"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                <span className="relative z-10 flex items-center justify-center">
                  Get Started
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            )}
          </div>
          
          {/* Animated icons */}
          <div className="mt-16 flex justify-center space-x-8 md:space-x-16">
            <div className="animate-bounce-slow">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faRobot} className="text-blue-400 text-2xl" />
              </div>
            </div>
            <div className="animate-bounce-medium">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faBrain} className="text-purple-400 text-2xl" />
              </div>
            </div>
            <div className="animate-bounce-fast">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faGlobe} className="text-emerald-400 text-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveSection('agents')}
                className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                  activeSection === 'agents'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                } border border-gray-200 dark:border-gray-600 focus:z-10 focus:outline-none`}
              >
                <FontAwesomeIcon icon={faRobot} className="mr-2" />
                Single Agents
              </button>
              <button
                onClick={() => setActiveSection('teams')}
                className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                  activeSection === 'teams'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                } border border-gray-200 dark:border-gray-600 focus:z-10 focus:outline-none`}
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                <div className="inline-flex rounded-md shadow-sm bg-white dark:bg-gray-700 p-1">
                  <button
                    onClick={() => setTeamViewType('cards')}
                    className={`px-6 py-3 text-sm font-medium rounded-lg flex items-center ${
                      teamViewType === 'cards'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                    } transition-all duration-200`}
                  >
                    <FontAwesomeIcon icon={faThLarge} className="mr-2" />
                    Card View
                  </button>
                  <button
                    onClick={() => setTeamViewType('list')}
                    className={`px-6 py-3 text-sm font-medium rounded-lg flex items-center ${
                      teamViewType === 'list'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                    } transition-all duration-200`}
                  >
                    <FontAwesomeIcon icon={faListUl} className="mr-2" />
                    List View
                  </button>
                </div>
              </div>

              {/* Teams Content */}
              <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-750 dark:to-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                {/* Loading State */}
                {formattedTeams.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <FontAwesomeIcon icon={faPeopleGroup} className="text-blue-600 dark:text-blue-400 text-3xl" />
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
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
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
      <div className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose Our AI Platform?
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Deploy powerful AI solutions with minimal setup and maximum flexibility
            </p>
          </div>
          
          {/* Interactive feature showcase */}
          <div className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => handleFeatureClick(index)}
                  className={`py-4 px-2 rounded-lg transition-all duration-300 ${
                    activeFeature === index 
                      ? `bg-gradient-to-r ${feature.color} text-white shadow-lg` 
                      : `${feature.bgLight} dark:${feature.bgDark} text-gray-700 dark:text-gray-300 hover:shadow-md`
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={feature.icon} 
                    className={`text-xl ${activeFeature === index ? 'text-white' : feature.iconColor}`} 
                  />
                  <div className="mt-2 font-medium">{feature.title}</div>
                </button>
              ))}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-500">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center mb-6 md:mb-0 md:mr-6 shadow-lg`}>
                    <FontAwesomeIcon icon={features[activeFeature].icon} className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {features[activeFeature].description}
                    </p>
                    
                    {/* Feature-specific content */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {activeFeature === 0 && (
                        <>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Instant Deployment</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Deploy agents in seconds with no setup required</p>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Pre-trained Models</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Agents come with optimized models for their tasks</p>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Proven Templates</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Start with templates built by AI experts</p>
                          </div>
                        </>
                      )}
                      
                      {activeFeature === 1 && (
                        <>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">Flexible Configuration</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Adjust parameters to match your exact needs</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">Custom Workflows</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Design unique processes for your business</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">API Integration</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Connect with your existing tools and services</p>
                          </div>
                        </>
                      )}
                      
                      {activeFeature === 2 && (
                        <>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Unlimited Agents</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Add as many agents as your workload requires</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Team Coordination</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Agents work together seamlessly as you scale</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Performance Optimization</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Automatically scales resources as needed</p>
                          </div>
                        </>
                      )}
                      
                      {activeFeature === 3 && (
                        <>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Data Encryption</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">End-to-end encryption for all your data</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Access Controls</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Granular permissions for team members</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Compliance Ready</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Built to meet enterprise security standards</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - More subtle gradient */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
        
        {/* Animated accent */}
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-2/3 h-48 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-3xl rounded-full animate-pulse-slow"></div>
        
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-400">Deploy your first AI agent today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signin')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 transition-colors"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Sign in'}
              </button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

export default Landing; 