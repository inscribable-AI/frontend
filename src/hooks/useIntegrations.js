import { useState, useEffect } from 'react';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState([
    {
      name: 'IPFS',
      description: 'Integrate IPFS into your dApps to easily store and sync customer data',
      logo: '📦', // Replace with actual IPFS logo/image path
      beta: false
    },
    {
      name: 'chatGPT',
      description: 'Explore content creation with AI to easily create campaign constants from analytics',
      logo: '🤖', // Replace with actual ChatGPT logo/image path
      beta: true
    },
    {
      name: 'google cloud',
      description: 'Sync all your user data with ease when you connect Google Cloud',
      logo: '☁️', // Replace with actual Google Cloud logo/image path
      beta: false
    },
    {
      name: 'chainlink price feed',
      description: 'Integrate external data into your dApps using Chainlink Price Feeds',
      logo: '🔗', // Replace with actual Chainlink logo/image path
      beta: true
    },
    {
      name: 'bulla network',
      description: 'Use this accounting tool for on-chain invoicing, payments, and account management',
      logo: '💰', // Replace with actual Bulla logo/image path
      beta: false
    },
    {
      name: 'storj',
      description: 'Manage your decentralized storage solution to secure data efficiently with Storj',
      logo: '💾', // Replace with actual Storj logo/image path
      beta: true
    }
  ]);

  const [moreIntegrations, setMoreIntegrations] = useState([
    {
      name: 'ipld',
      description: 'Link your decentralized data safely through simple data structures stored on IPFS',
      logo: '🔗', // Replace with actual IPLD logo/image path
      beta: false
    },
    {
      name: 'steemit',
      description: 'Add decentralized social blogging for users of your dApp with steemit',
      logo: '📝', // Replace with actual Steemit logo/image path
      beta: false
    },
    {
      name: 'Dtube',
      description: 'Decentralized video streaming available to be integrated for your users',
      logo: '🎥', // Replace with actual DTube logo/image path
      beta: false
    },
    {
      name: 'livepeer',
      description: 'Enable peer to peer constant communication between two people',
      logo: '📡', // Replace with actual Livepeer logo/image path
      beta: true
    },
    {
      name: 'arweave',
      description: 'Store your data and files across a distributed system while receiving revenues',
      logo: '🗄️', // Replace with actual Arweave logo/image path
      beta: true
    },
    {
      name: 'Chainlink functions',
      description: 'Bring off-chain data and information on-chain in your dApps with ease using Chainlink Functions',
      logo: '⚡', // Replace with actual Chainlink Functions logo/image path
      beta: false
    }
  ]);

  // You can add loading state and error handling here if needed
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // If you need to fetch data from an API, you can use useEffect
  useEffect(() => {
    // Add API fetch logic here if needed
    // For now, we're using static data
  }, []);

  return {
    integrations,
    moreIntegrations,
    isLoading,
    error
  };
} 