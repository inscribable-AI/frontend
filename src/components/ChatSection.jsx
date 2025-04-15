import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { taskAPI } from '../services/api';
import { db } from '../firebase/config'; // Make sure you have Firebase configured
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, arrayUnion, getDoc, onSnapshot } from 'firebase/firestore';
import { ChatSidebar } from './ChatSidebar';
import { firebaseMessageService } from '../services/firebaseService';
import { useNavigate } from 'react-router-dom';
import { faExpand, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function ChatSection({ team, isCollapsed, onToggleCollapse }) {
  
  console.log('team', team);
  
  const [currentUser, setCurrentUser] = useState({
    id: 'default-user',
    name: 'User',
    email: 'user@example.com'
  });

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTaskMode, setIsTaskMode] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseInputRef = useRef(''); // Store the base input before recording starts
  const textareaRef = useRef(null); // Add ref for textarea
  const [threadId, setThreadId] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const currentThreadIdRef = useRef(null);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const navigate = useNavigate();

  const handleTaskClick = () => {
    setIsTaskMode(!isTaskMode);
  };

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return;
    }
    
    // Create a new recognition instance each time to avoid persistent results
    if (isRecording) {
      // Clean up any existing instance
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      
      // Create a fresh instance
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Set up event handlers
      recognitionRef.current.onresult = (event) => {
        // Only use the results from this session
        let currentTranscript = '';
        
        // Get only the results since we started this recording session
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        // Set the input message to the base input plus current transcript
        setInputMessage(baseInputRef.current + (baseInputRef.current && currentTranscript ? ' ' : '') + currentTranscript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
          setIsRecording(false);
        }
      };
      
      // Start the recognition
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsRecording(false);
      }
    } else {
      // Stop recognition when isRecording becomes false
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    
    // Clean up
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleVoiceClick = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      toast.success('Voice recording stopped');
    } else {
      // Start recording - save current input as base
      baseInputRef.current = inputMessage;
      setIsRecording(true);
      toast.success('Voice recording started - speak now');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      toast.info(`File selected: ${file.name}`);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentChatId]);

  // Function to auto-resize the textarea
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set new height based on content, with min and max boundaries
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200);
    textarea.style.height = `${newHeight}px`;
  };

  // Auto-resize when input changes
  useEffect(() => {
    autoResizeTextarea();
  }, [inputMessage]);

  //Fetch user's chat history when component mounts
  useEffect(() => {
    if (team?.id) {
      fetchChatHistory();
    }
  }, [team?.id]);

  const fetchChatHistory = async () => {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('teamId', '==', team.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const chatHistory = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));    
      setChats(chatHistory);
      
      // After fetching chat history, select the most recent chat
      if (chatHistory.length > 0) {
        const mostRecentChat = chatHistory[0]; // First chat is the most recent due to orderBy('createdAt', 'desc')
        
        // Set the current chat ID and thread ID
        setCurrentChatId(mostRecentChat.id);
        setThreadId(mostRecentChat.threadId);
        
        // Set the messages from the most recent chat
        setMessages(mostRecentChat.messages || []);
        
        // Scroll to bottom after a short delay
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  const handleNewChat = () => {
    // Clear messages
    setMessages([]);
    // Clear thread ID
    setThreadId(null);
    // Clear current chat ID
    setCurrentChatId(null);
    // Clear the session thread ID reference
    currentThreadIdRef.current = null;
  };

  const handleChatSelect = async (chatId) => {
    setCurrentChatId(chatId);
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
      setThreadId(selectedChat.threadId);
      setMessages(selectedChat.messages || []);
      // Scroll to bottom after a short delay to ensure rendering is complete
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // Replace the interval with a real-time Firestore listener
  useEffect(() => {
    // Don't do anything if we don't have a current chat ID
    if (!currentChatId) return;
      
    // Set up a real-time listener for the current chat document
    const chatDocRef = doc(db, 'chats', currentChatId);
    
    // This listener will trigger any time the document changes
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
      
        if (chatData.messages) {
          // Update messages in real-time
          setMessages(chatData.messages);
          
          // Scroll to bottom after a short delay
          setTimeout(scrollToBottom, 100);
        }
      }
    }, (error) => {
      console.error("Error in real-time listener:", error);
    });
    
    // Clean up function to remove the listener when component unmounts or chat changes
    return () => {
      unsubscribe();
    };
  }, [currentChatId]); // Re-run when currentChatId changes

  // Modify handleSendMessage to include fetchChatHistory
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = inputMessage.trim();
    if (!messageText || isLoading) return;

    setIsLoading(true);
    setInputMessage('');
    
    try {
      // Create a new message object
      const newMessage = {
        content: messageText,
        is_from_user: true,
        sender_id: currentUser?.id || 'default-user',
        sender_name: currentUser?.name || 'User',
        thread_id: currentChatId,
        timestamp: new Date(),
        status: 'sending',
        id: `temp-${Date.now()}`, // Add a temporary ID
        sender: 'User',
        message: messageText, // Important: add message property as that's what the rendering code uses
      };
      
      // Add the user message to the local state IMMEDIATELY regardless of currentChatId
      setMessages(prev => [...prev, newMessage]);
      
      // Show agent typing indicator
      setTimeout(() => {
        setIsAgentTyping(true);
      }, 500);
      
      // Use the sendMessage function to send the message
      const { threadId, taskId } = await sendMessage(newMessage);
      
      // If we got a threadId from the response and there's no current chat, update it
      if (threadId && !currentChatId) {
        setCurrentChatId(threadId);
        setThreadId(threadId);
      }
      
      // After sending the message, refresh the chat history
      await fetchChatHistory();
      
      // If we have a currentChatId, also fetch the latest messages for this chat
      if (currentChatId) {
        // Fetch the latest messages for this specific chat
        try {
          const chatDocRef = doc(db, 'chats', currentChatId);
          const chatDoc = await getDoc(chatDocRef);
          if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            if (chatData.messages) {
              setMessages(chatData.messages);
            }
          }
        } catch (error) {
          console.error('Error fetching latest messages:', error);
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      // Remove typing indicator if there's an error
      setIsAgentTyping(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add effect to monitor and remove typing indicator when new message arrives
  useEffect(() => {
    if (messages.length > 0 && isAgentTyping) {
      // Check if the last message is from the agent
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender !== 'User' && !lastMessage.is_from_user) {
        // If we get an agent message, remove the typing indicator
        setIsAgentTyping(false);
      }
    }
  }, [messages, isAgentTyping]);
  
  // Also modify sendMessage to avoid state resets
  const sendMessage = async (messageData) => {
    try {
      // Format data according to API expectations
      const apiData = {
        agentId: team?.id,
        taskMessage: messageData.content,
        version: 'v2',  
      };
      
      // First check if we have a threadId in the session ref
      if (currentThreadIdRef.current) {
        // Use the thread ID from the current session
        apiData.thread_id = currentThreadIdRef.current;
      }
      // Otherwise, check if we have a currentChatId
      else if (currentChatId) {
        // Get the chat document using currentChatId
        const chatDocRef = doc(db, 'chats', currentChatId);
        const chatDoc = await getDoc(chatDocRef);
        
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          if (chatData.threadId) {
            apiData.thread_id = chatData.threadId;
            // Store this for future messages in this session
            currentThreadIdRef.current = chatData.threadId;
          }
        }
      } else if (messageData.thread_id) {
        apiData.thread_id = messageData.thread_id;
        // Store this for future messages in this session
        currentThreadIdRef.current = messageData.thread_id;
      }
      
      // Call the API service
      const response = await taskAPI.sendMessage(apiData);
      
      // Extract the returned IDs
      const { taskId, threadId, chatId, isNewChat } = response.data;
      
      // Store the new threadId for future messages in this session
      if (threadId && !currentThreadIdRef.current) {
        currentThreadIdRef.current = threadId;
      }

      // Don't modify the messages state here - let the real-time listener handle it
      
      return {
        taskId,
        threadId
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  };

  // Function to handle sidebar toggle without affecting other collapse logic
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Function to load chat messages
  const loadChatMessages = async (loadMore = false) => {
    if (!currentChatId || isLoadingMessages) return;
    
    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await firebaseMessageService.getTeamChat(
        currentChatId, // Using currentChatId as the thread_id
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
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load messages when chat is selected
  useEffect(() => {
    if (currentChatId) {
      // Reset pagination
      setLastMessageId(null);
      setHasMoreMessages(true);
      
      // Load messages for selected chat
      loadChatMessages();
    }
  }, [currentChatId]);

  // Add a function to load more messages
  const handleLoadMoreMessages = () => {
    if (hasMoreMessages && !isLoadingMessages) {
      loadChatMessages(true);
    }
  };

  // Add this function to handle navigation to the full chat page
  const handleExpandChat = () => {
    // Navigate to chat page with the team ID as a parameter
    navigate(`/chat/${team?.id || 'default'}`, { state: { team } });
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-gray-800 rounded-l-xl shadow-sm border-l border-gray-200 dark:border-gray-700 w-[50px]">
        <button
          onClick={onToggleCollapse}
          className="p-4 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg
            className="w-6 h-6 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Add the ChatSidebar component */}
      <ChatSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        chats={chats || []} // Use existing chats state or empty array
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect} // Use existing handler
        onNewChat={handleNewChat} // Use existing handler
      />
      
      {/* Existing JSX with additional margin to accommodate sidebar */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-14' : 'ml-64 md:ml-80'
      }`}>
        <div className="flex flex-col h-screen bg-white dark:bg-gray-800 shadow-md border-l border-gray-200 dark:border-gray-700 w-full md:w-[400px] md:rounded-l-xl">
          {/* Chat header with improved styling */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-300 font-medium">
                    {team?.name?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {team?.name || 'Team Chat'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentChatId ? 'Current Chat' : 'New Chat'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExpandChat}
                  className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  title="Expand to full screen"
                >
                  <FontAwesomeIcon icon={faExpand} className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNewChat}
                  className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button
                  onClick={onToggleCollapse}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages container with consistent spacing */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-32">
                <div className="flex space-x-2 animate-pulse">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages
                  .filter(msg => msg && ((msg.message && msg.message.trim() !== '') || msg.content))
                  .map((msg) => {
                    // Determine if message is from user based on the sender field
                    const isFromUser = msg.sender === 'User' || 
                                     msg.is_from_user ||
                                     msg.sender === currentUser?.name;
                    
                    return (
                      <div 
                        key={msg.id || `msg-${Date.now()}-${Math.random()}`}
                        className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Left avatar for non-user messages */}
                        {!isFromUser && (
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2">
                            <span className="text-indigo-600 dark:text-indigo-300 text-xs font-medium">
                              {(msg.sender?.charAt(0) || team?.name?.charAt(0) || 'A').toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Message bubble */}
                        <div 
                          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                            isFromUser 
                              ? 'bg-primary-500 text-white rounded-br-none' 
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none shadow-sm'
                          } break-words overflow-auto`}
                        >
                          {/* Sender name for agent messages */}
                          {!isFromUser && (
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              {msg.sender || team?.name || 'Agent'}
                            </div>
                          )}
                          
                          {/* Message content - make it responsive */}
                          <div className="text-sm whitespace-pre-wrap overflow-hidden">
                            {msg.message || msg.content}
                          </div>
                          
                          {/* Timestamp */}
                          <div className="text-xs mt-1 text-right opacity-70">
                            {msg.timestamp?.toDate 
                              ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                              : msg.timestamp instanceof Date 
                                ? msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                : 'Now'}
                          </div>
                        </div>
                        
                        {/* Right avatar for user messages */}
                        {isFromUser && (
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center ml-2">
                            <span className="text-primary-600 dark:text-primary-300 text-xs font-medium">
                              {(currentUser?.name?.charAt(0) || 'U').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                
                {/* Add typing indicator */}
                {isAgentTyping && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2">
                      <span className="text-indigo-600 dark:text-indigo-300 text-xs font-medium">
                        {(team?.name?.charAt(0) || 'A').toUpperCase()}
                      </span>
                    </div>
                    <div className="max-w-[75%] px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none shadow-sm">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {team?.name || 'Agent'}
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet</p>
                <p className="text-sm mt-1">Start the conversation by sending a message</p>
              </div>
            )}
          </div>

          {/* Input section with consistent styling */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={isTaskMode ? "Enter your task..." : "Ask anything"}
                rows={1}
                className={`w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-3 pr-12 
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400
                  placeholder-gray-500 dark:placeholder-gray-400 
                  resize-none overflow-hidden 
                  transition-colors duration-200
                  ${isTaskMode ? 'border-primary-500' : ''}`}
                style={{
                  minHeight: '44px',
                  maxHeight: '200px',
                  lineHeight: '1.5',
                  WebkitTapHighlightColor: 'transparent'
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isLoading ? (
                  <div className="flex space-x-2 px-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 disabled:opacity-50 disabled:hover:text-gray-500 dark:disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Action buttons with consistent colors */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleTaskClick}
                  className={`flex items-center space-x-2 transition-colors ${
                    isTaskMode 
                      ? 'text-primary-500' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="text-sm">Task</span>
                </button>

                <button
                  onClick={handleVoiceClick}
                  className={`flex items-center space-x-2 relative ${
                    isRecording 
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {isRecording ? (
                    <>
                      {/* Recording indicator - animated dot */}
                      <span className="absolute -top-1 -left-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      
                      {/* Microphone icon - recording state */}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Recording...</span>
                    </>
                  ) : (
                    <>
                      {/* Microphone icon - inactive state */}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      <span className="text-sm">Voice</span>
                    </>
                  )}
                </button>

                <label className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                  />
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span className="text-sm">Attach</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
