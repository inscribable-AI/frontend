import React from 'react';
import ComingSoon from '../components/ComingSoon';

const Account = () => {
  return (
    <ComingSoon
      title="Accounts Management"
      description="We're building a powerful accounts management system. Stay tuned for features like user roles, permissions, and team collaboration tools."
      icon={
        <svg 
          className="w-24 h-24 text-blue-500 dark:text-blue-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      }
    />
  );
};

export default Account; 