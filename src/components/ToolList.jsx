import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolCard from './cards/ToolCard';
import ToolListCard from './cards/ToolListCard';

export function ToolList({ 
  tools, 
  selectedTools, 
  onToolSelect,
  className = "",
  layout = "grid" // 'grid' or 'list'
}) {
  const [previousLayout, setPreviousLayout] = useState(layout);
  const [animationComplete, setAnimationComplete] = useState(true);
  
  // Track layout changes to trigger animations
  useEffect(() => {
    if (layout !== previousLayout) {
      setAnimationComplete(false);
      setPreviousLayout(layout);
    }
  }, [layout, previousLayout]);

  const containerClassName = layout === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div className={`${containerClassName} ${className}`}>
      {tools.map((tool) => (
        <motion.div
          key={tool.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {layout === 'grid' ? (
            <ToolCard
              tool={tool}
              isSelected={selectedTools.some(t => t.id === tool.id)}
              onSelect={() => onToolSelect(tool)}
              selectable={true}
            />
          ) : (
            <ToolListCard
              tool={tool}
              isSelected={selectedTools.some(t => t.id === tool.id)}
              onSelect={() => onToolSelect(tool)}
              selectable={true}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
} 