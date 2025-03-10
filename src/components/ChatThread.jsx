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
      {/* Thread header with related tasks */}
      <div className="thread-header">
        <h2>Thread #{threadId}</h2>
        
        {tasksLoading ? (
          <div className="loading-indicator">Loading tasks...</div>
        ) : (
          relatedTasks.length > 0 && (
            <div className="related-tasks">
              <h3>Related Tasks</h3>
              <ul>
                {relatedTasks.map(task => (
                  <li key={task.id}>
                    <span>{task.description || task.title}</span>
                    <span className={`status status-${task.status?.toLowerCase()}`}>
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
      
      {/* Message list with load more button */}
      <div className="message-list" ref={messageContainerRef}>
        {hasMoreMessages && (
          <button 
            className="load-more-button"
            onClick={loadMoreMessages}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load earlier messages'}
          </button>
        )}
        
        {messages.length === 0 && !loading ? (
          <div className="empty-state">No messages in this thread</div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.isCurrentUser ? 'message-outgoing' : 'message-incoming'}`}
            >
              <div className="message-sender">{message.sender_name || 'Unknown'}</div>
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {message.timestamp?.toDate ? 
                  message.timestamp.toDate().toLocaleTimeString() : 
                  new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        
        {loading && <div className="loading-indicator">Loading messages...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {/* Using existing message input component - just replace the send handler */}
      <MessageInput 
        threadId={threadId}
        onMessageSent={() => {
          // Refresh messages when new message is sent
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