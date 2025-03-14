import React, { useState, useEffect } from 'react';
import LandingLayout from '../components/layout/LandingLayout';
import { Link } from 'react-router-dom';

function BlogPost({ post }) {
  const { fields } = post;
  
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {fields.featuredImage && (
        <img
          src={fields.featuredImage.fields.file.url}
          alt={fields.title}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {fields.author && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              By {fields.author}
            </span>
          )}
          {fields.tags && (
            <div className="flex gap-2">
              {fields.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {fields.title}
        </h2>
        
        {fields.excerpt && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {fields.excerpt}
          </p>
        )}
        
        <Link 
          to={`/blog/${fields.slug}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Read more
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

function Blog() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const initContentful = async () => {
      try {
        const contentful = await import('contentful');
        const client = contentful.createClient({
          space: '7lpoj3cttgsl',
          accessToken:'Bnl4ZXSqkmTptGPGbZ4u9DLqecgXJKztoxM2LAzjmxs'
        });

        const response = await client.getEntries({
          content_type: 'blogPost',
          order: '-sys.createdAt'
        });

        setPosts(response.items);
        setIsLoading(false);
      } catch (error) {
        console.error('Contentful error:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    initContentful();
  }, []);

  return (
    <LandingLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Updates & News
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Stay up to date with the latest developments and insights
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 dark:text-red-400">
            Error: {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            No posts found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <BlogPost key={post.sys.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </LandingLayout>
  );
}

export default Blog; 