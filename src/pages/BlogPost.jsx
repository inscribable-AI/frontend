import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import LandingLayout from '../components/layout/LandingLayout';

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const contentful = await import('contentful');
        const client = contentful.createClient({
          space: '7lpoj3cttgsl',
          accessToken: 'Bnl4ZXSqkmTptGPGbZ4u9DLqecgXJKztoxM2LAzjmxs'
        });

        const response = await client.getEntries({
          content_type: 'blogPost',
          'fields.slug': slug
        });

        if (response.items.length > 0) {
          setPost(response.items[0]);
        } else {
          setError('Post not found');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const richTextOptions = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => <p className="mb-4">{children}</p>,
      [BLOCKS.HEADING_1]: (node, children) => <h1 className="text-4xl font-bold mb-6">{children}</h1>,
      [BLOCKS.HEADING_2]: (node, children) => <h2 className="text-3xl font-bold mb-4">{children}</h2>,
      [BLOCKS.HEADING_3]: (node, children) => <h3 className="text-2xl font-bold mb-3">{children}</h3>,
      [BLOCKS.UL_LIST]: (node, children) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
      [BLOCKS.OL_LIST]: (node, children) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
      [BLOCKS.LIST_ITEM]: (node, children) => <li className="mb-2">{children}</li>,
      [BLOCKS.QUOTE]: (node, children) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">{children}</blockquote>
      ),
      [INLINES.HYPERLINK]: (node, children) => (
        <a href={node.data.uri} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    }
  };

  if (isLoading) {
    return (
      <LandingLayout>
        <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </LandingLayout>
    );
  }

  if (error) {
    return (
      <LandingLayout>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-red-600 dark:text-red-400">Error: {error}</div>
        </div>
      </LandingLayout>
    );
  }

  if (!post) {
    return (
      <LandingLayout>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Post not found</div>
        </div>
      </LandingLayout>
    );
  }

  const { fields } = post;

  return (
    <LandingLayout>
      <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <Link to="/blog" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Back to Blog
        </Link>

        {fields.featuredImage && (
          <img
            src={fields.featuredImage.fields.file.url}
            alt={fields.title}
            className="w-full h-96 object-cover rounded-xl mb-8"
          />
        )}

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {fields.title}
        </h1>

        <div className="flex items-center gap-4 mb-8 text-gray-600 dark:text-gray-400">
          {fields.author && (
            <span>By {fields.author}</span>
          )}
          <span>•</span>
          <time dateTime={fields.publishDate}>
            {new Date(fields.publishDate).toLocaleDateString()}
          </time>
          
          {fields.tags && (
            <>
              <span>•</span>
              <div className="flex gap-2">
                {fields.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="prose prose-lg max-w-none">
          {documentToReactComponents(fields.content, richTextOptions)}
        </div>
      </article>
    </LandingLayout>
  );
}

export default BlogPost; 