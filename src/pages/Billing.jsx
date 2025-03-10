import React from 'react';
import ComingSoon from '../components/ComingSoon';

const Billing = () => {
  return (
    <ComingSoon
      title="Billing & Subscriptions"
      description="We're working on a seamless billing experience. Soon you'll be able to manage subscriptions, view invoices, and handle payments all in one place."
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
          />
        </svg>
      }
    />
  );
};

export default Billing; 