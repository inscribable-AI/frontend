import React from 'react';
import { motion } from 'framer-motion';
import AgentCard from './cards/AgentCard';

export function AgentList({ 
  agents, 
  selectedAgents, 
  onAgentSelect,
  className = "",
  layout = "grid" // 'grid' or 'list'
}) {
  const getAgentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const containerClassName = layout === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'
    : 'space-y-4';

  return (
    <div className={`${containerClassName} ${className}`}>
      {agents.map((agent) => (
        <motion.div
          key={agent.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <AgentCard
            agent={agent}
            isSelected={selectedAgents.some(a => a.id === agent.id)}
            onSelect={() => onAgentSelect(agent)}
            layout={layout}
          />
        </motion.div>
      ))}
    </div>
  );
} 