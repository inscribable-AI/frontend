import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const env = {
  // API Configuration
  API_URL: 'http://localhost:3000/api',
  
  // Authentication
  AUTH_TOKEN_KEY: 'auth_token',
  // Environment
  NODE_ENV: 'development',
  
  // Other configurations
  APP_NAME: 'Team Management',
  // Contentful
  CONTENTFUL_SPACE_ID: window.process?.env?.REACT_APP_CONTENTFUL_SPACE_ID || '7lpoj3cttgsl',
  CONTENTFUL_ACCESS_TOKEN: window.process?.env?.REACT_APP_CONTENTFUL_ACCESS_TOKEN || 'Bnl4ZXSqkmTptGPGbZ4u9DLqecgXJKztoxM2LAzjmxs',
};

export default env;