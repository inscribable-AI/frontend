import React, { useState, useEffect, useRef } from 'react';
import { firebaseMessageService } from '../services/firebaseService';

// Using existing component structure, just updating the data fetching
export function ChatThread({ threadId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  const messageContainerRef = useRef(null);
  
  // Initial message load
  useEffect(() => {
    if (threadId) {
      loadMessages();
    }
  }, [threadId]);
  
  const loadMessages = async (loadMore = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Use the updated paginated method
      const fetchedMessages = await firebaseMessageService.getMessagesByThreadId(
        threadId,
        20, // pageSize 
        loadMore ? lastMessageId : null
      );
      
      if (fetchedMessages && fetchedMessages.length > 0) {
        if (loadMore) {
          setMessages(prev => [...prev, ...fetchedMessages]);
        } else {
          setMessages(fetchedMessages);
        }
        
        setLastMessageId(fetchedMessages[fetchedMessages.length - 1].id);
        setHasMoreMessages(fetchedMessages.length === 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreMessages = () => {
    if (hasMoreMessages && !loading) {
      loadMessages(true);
    }
  };
  
  // Fetch related tasks for this thread
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  useEffect(() => {
    if (threadId) {
      fetchRelatedTasks();
    }
  }, [threadId]);
  
  const fetchRelatedTasks = async () => {
    setTasksLoading(true);
    try {
      // Use the updated paginated method for tasks
      const tasks = await firebaseMessageService.getTaskByThreadId(threadId, 5);
      setRelatedTasks(tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };
  
  return (
    <div className="chat-thread">
      {/* Thread header with updated styling */}
      <div className="thread-header p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thread #{threadId}</h2>
        
        {tasksLoading ? (
          <div className="loading-indicator flex space-x-2 mt-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200"></div>
          </div>
        ) : (
          relatedTasks.length > 0 && (
            <div className="related-tasks mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Related Tasks</h3>
              <ul className="space-y-2">
                {relatedTasks.map(task => (
                  <li key={task.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{task.description || task.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs 
                      ${task.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        task.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
      
      {/* Message list with updated styling */}
      <div className="message-list p-4 overflow-y-auto flex-1" ref={messageContainerRef}>
        {hasMoreMessages && (
          <button 
            className="load-more-button w-full py-2 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 border border-gray-200 dark:border-gray-700 rounded-md mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={loadMoreMessages}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load earlier messages'}
          </button>
        )}
        
        {messages.length === 0 && !loading ? (
          <div className="empty-state flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages in this thread</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`message flex mb-4 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isCurrentUser && (
                <div className="message-avatar h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-2">
                  <span className="text-primary-600 dark:text-primary-300 text-xs font-medium">
                    {message.sender_name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              
              <div className={`message-bubble max-w-[75%] px-4 py-2 rounded-lg ${
                message.isCurrentUser 
                  ? 'bg-primary-500 text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none shadow-sm'
              }`}>
                <div className="message-content">{message.content}</div>
                <div className="message-time text-xs mt-1 opacity-70 text-right">
                  {message.timestamp?.toDate ? 
                    message.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              
              {message.isCurrentUser && (
                <div className="message-avatar h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center ml-2">
                  <span className="text-primary-600 dark:text-primary-300 text-xs font-medium">
                    U
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="loading-indicator flex justify-center space-x-2 my-4">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
        
        {error && <div className="error-message p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">{error}</div>}
      </div>
      
      {/* Message input with consistent styling */}
      <MessageInput 
        threadId={threadId}
        onMessageSent={() => {
          setLastMessageId(null);
          loadMessages();
        }}
      />
    </div>
  );
}

// Assuming this component exists and we're just updating the prop handling
function MessageInput({ threadId, onMessageSent }) {
  const [message, setMessage] = useState('');
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      // Implement your send message logic here
      // await sendMessage(threadId, message);
      
      // Clear input and notify parent
      setMessage('');
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <form className="message-input-form" onSubmit={handleSend}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="message-input"
      />
      <button type="submit" className="send-button">Send</button>
    </form>
  );
} 