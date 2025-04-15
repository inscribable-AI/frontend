import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faMicrophone, 
  faPaperclip, 
  faStop, 
  faPlus, 
  faArrowLeft,
  faCog,
  faBrain,
  faRobot,
  faBars, 
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { firebaseMessageService } from '../services/firebaseService';
import { taskAPI } from '../services/api';
import { collection, query, where, orderBy, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useDarkMode } from '../contexts/DarkModeContext';
import DarkModeToggle from '../components/DarkModeToggle';

function ChatPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const location = useLocation();
  const team = location.state?.team || { id: teamId || 'default-team', name: 'AI Assistant' };
  const { isDarkMode } = useDarkMode();
  
  // States for responsive design
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  });
  
  // Add animation state for agent
  const [agentState, setAgentState] = useState({
    isTyping: false,
    isProcessing: false,
    processingPhase: 0,
  });
  
  // Your existing state variables
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseInputRef = useRef('');
  const textareaRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const currentThreadIdRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const [currentUser, setCurrentUser] = useState({
    id: 'default-user',
    name: 'User',
    email: 'user@example.com'
  });

  // Monitor screen size changes and update responsive state
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024
      });
      
      // Auto-show sidebar on desktop
      if (width >= 1024) {
        setIsSidebarVisible(true);
      } else if (width < 768 && isSidebarVisible) {
        // Auto-hide sidebar when resizing from desktop to mobile
        setIsSidebarVisible(false);
      }
    };
    
    // Set initial sidebar visibility
    if (window.innerWidth >= 1024) {
      setIsSidebarVisible(true);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close sidebar when clicking outside on mobile/tablet
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        screenSize.isMobile && 
        isSidebarVisible && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('[data-sidebar-toggle]')
      ) {
        setIsSidebarVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [screenSize.isMobile, isSidebarVisible]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, agentState]);

  // Auto-resize the textarea
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [inputMessage]);

  // Your existing functions
  const fetchChatHistory = async () => {
    try {
      // Your existing code for fetching chat history
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
        const mostRecentChat = chatHistory[0]; 
        
        // Set the current chat ID and thread ID
        setCurrentChatId(mostRecentChat.id);
        currentThreadIdRef.current = mostRecentChat.threadId;
        
        // Set the messages from the most recent chat
        setMessages(mostRecentChat.messages || []);
        
        // Scroll to bottom after a short delay
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  // Fetch chat history on component mount
  useEffect(() => {
    if (team?.id) {
      fetchChatHistory();
    }
  }, [team?.id]);

  // Set up real-time listener for chat updates
  useEffect(() => {
    if (!currentChatId) return;
    
    const chatDocRef = doc(db, 'chats', currentChatId);
    
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
      
        if (chatData.messages) {
          setMessages(chatData.messages);
        }
      }
    }, (error) => {
      console.error("Error in real-time listener:", error);
    });
    
    return () => unsubscribe();
  }, [currentChatId]);

  // Update handleSendMessage to include animation states
  const handleSendMessage = async (e) => {
    e?.preventDefault();
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
        id: `temp-${Date.now()}`,
        sender: 'User',
        message: messageText,
      };
      
      // Add the user message to the local state immediately
      setMessages(prev => [...prev, newMessage]);
      
      // Start showing the agent processing animation
      setAgentState({
        isTyping: false,
        isProcessing: true, 
        processingPhase: 0
      });
      
      // Close sidebar on mobile after sending message
      if (screenSize.isMobile) {
        setIsSidebarVisible(false);
      }
      
      // Send the message
      const { threadId, taskId } = await sendMessage(newMessage);
      
      // After sending, show simpler typing indicator
      setTimeout(() => {
        setAgentState({
          isTyping: true,
          isProcessing: false,
          processingPhase: 0
        });
      }, 2000);
      
      // If we got a threadId and there's no current chat, update it
      if (threadId && !currentChatId) {
        setCurrentChatId(threadId);
        currentThreadIdRef.current = threadId;
      }
      
      // After sending the message, refresh the chat history
      await fetchChatHistory();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setAgentState({
        isTyping: false,
        isProcessing: false,
        processingPhase: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back button
  const handleBackToAgent = () => {
    navigate(`/dashboard/agent/${team.id}`);
  };

  // Handle new chat
  const handleNewChat = () => {
    setMessages([]);
    currentThreadIdRef.current = null;
    setCurrentChatId(null);
    
    // Close sidebar on mobile after creating a new chat
    if (screenSize.isMobile) {
      setIsSidebarVisible(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chatId) => {
    setCurrentChatId(chatId);
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
      currentThreadIdRef.current = selectedChat.threadId;
      setMessages(selectedChat.messages || []);
      
      // Close sidebar on mobile after selecting a chat
      if (screenSize.isMobile) {
        setIsSidebarVisible(false);
      }
    }
  };

  // Your existing sendMessage function
  const sendMessage = async (messageData) => {
    try {
      // Format data according to API expectations
      const apiData = {
        agentId: team?.id,
        taskMessage: messageData.content,
        version: 'v2',  
      };
      
      // Add thread ID if available
      if (currentThreadIdRef.current) {
        apiData.thread_id = currentThreadIdRef.current;
      } else if (currentChatId) {
        const chatDocRef = doc(db, 'chats', currentChatId);
        const chatDoc = await getDoc(chatDocRef);
        
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          if (chatData.threadId) {
            apiData.thread_id = chatData.threadId;
            currentThreadIdRef.current = chatData.threadId;
          }
        }
      } else if (messageData.thread_id) {
        apiData.thread_id = messageData.thread_id;
        currentThreadIdRef.current = messageData.thread_id;
      }
      
      // Call the API service
      const response = await taskAPI.sendMessage(apiData);
      
      // Extract the returned IDs
      const { taskId, threadId, chatId, isNewChat } = response.data;
      
      if (threadId && !currentThreadIdRef.current) {
        currentThreadIdRef.current = threadId;
      }

      return { taskId, threadId };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  };

  // Cycle through processing phases for animation
  useEffect(() => {
    let processingInterval;
    
    if (agentState.isProcessing) {
      processingInterval = setInterval(() => {
        setAgentState(prev => ({
          ...prev,
          processingPhase: (prev.processingPhase + 1) % 3
        }));
      }, 3000);
    }
    
    return () => {
      if (processingInterval) clearInterval(processingInterval);
    };
  }, [agentState.isProcessing]);

  // Reset animations when new message is received
  useEffect(() => {
    if (messages.length > 0 && (agentState.isTyping || agentState.isProcessing)) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender !== 'User' && !lastMessage.is_from_user) {
        setAgentState({
          isTyping: false,
          isProcessing: false,
          processingPhase: 0
        });
      }
    }
  }, [messages, agentState]);

  // Voice recording functionality
  const handleVoiceClick = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
      toast.success('Voice recording stopped');
    } else {
      baseInputRef.current = inputMessage;
      setIsRecording(true);
      toast.success('Voice recording started - speak now');
    }
  };

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return;
    }
    
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
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
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsRecording(false);
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      toast.info(`File selected: ${file.name}`);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  return (
    <div className={`flex h-screen ${
      isDarkMode ? 'bg-dark-bg text-white' : 'bg-gray-50 text-gray-900'
    } transition-colors duration-200 overflow-hidden`}>
      {/* Mobile overlay when sidebar is open */}
      {isSidebarVisible && screenSize.isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}
      
      {/* Sidebar - responsive with transitions */}
      <div 
        ref={sidebarRef}
        className={`fixed lg:relative z-40 h-full transition-all duration-300 ease-in-out ${
          isSidebarVisible 
            ? 'left-0' 
            : screenSize.isMobile ? '-left-full' : screenSize.isTablet ? '-left-full lg:left-0' : 'left-0'
        } ${
          isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-200'
        } border-r shadow-lg lg:shadow-none w-[280px] sm:w-[320px] lg:w-[280px] xl:w-[320px]`}
        style={{width: isSidebarVisible || screenSize.isDesktop ? (screenSize.isDesktop ? '320px' : '280px') : '0px'}}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <button 
            onClick={handleBackToAgent}
            className={`flex items-center gap-2 p-2 rounded-lg ${
              isDarkMode 
                ? 'hover:bg-gray-700/50 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            } transition-colors`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
            <span className="font-medium">Back</span>
          </button>
          
          {/* Close sidebar button - mobile only */}
          {!screenSize.isDesktop && (
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              onClick={() => setIsSidebarVisible(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        {/* New chat button */}
        <div className="p-4 flex">
          <button 
            onClick={handleNewChat}
            className={`flex items-center justify-center w-full gap-2 p-2.5 rounded-lg ${
              isDarkMode 
                ? 'bg-primary-900/30 hover:bg-primary-900/50 text-primary-400 border border-primary-700/50' 
                : 'bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-100'
            } transition-colors`}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="font-medium">New chat</span>
          </button>
        </div>
        
        {/* Chat history list */}
        <div className="overflow-y-auto py-2 px-3 h-[calc(100%-132px)]">
          <h3 className={`text-xs font-semibold uppercase mb-2 px-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Recent Conversations</h3>
          
          {chats.length > 0 ? (
            <div className="space-y-1">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg overflow-hidden transition-colors ${
                    currentChatId === chat.id 
                      ? isDarkMode 
                        ? 'bg-primary-900/30 text-primary-300 border-l-2 border-primary-500' 
                        : 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                      : isDarkMode
                        ? 'hover:bg-gray-700/50 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {chat.title || "Untitled Chat"}
                      </div>
                      <div className={`text-xs mt-1 truncate ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {chat.lastMessage || "No messages"}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Main chat area - responsive with transitions */}
      <div className={`flex-1 flex flex-col relative transition-all duration-300`}>
        {/* Chat header */}
        <div className={`flex items-center justify-between py-4 px-4 border-b ${
          isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-200'
        } transition-colors duration-200`}>
          {/* Sidebar toggle for mobile/tablet */}
          {!screenSize.isDesktop && (
            <button 
              data-sidebar-toggle
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400"
              onClick={toggleSidebar}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
          
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full ${
              isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
            } flex items-center justify-center ${!screenSize.isDesktop ? 'ml-2' : ''} mr-3`}>
              <span className="text-sm font-medium">
                {team?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-semibold truncate max-w-[150px] sm:max-w-xs">
                {team?.name || 'AI Assistant'}
              </h2>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } truncate max-w-[150px] sm:max-w-xs`}>
                {currentChatId ? 'Current conversation' : 'New conversation'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleNewChat}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-primary-400' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-primary-600'
              } transition-colors`}
              title="New conversation"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            </button>
            
            {/* Dark mode toggle */}
            <DarkModeToggle />
          </div>
        </div>
        
        {/* Chat messages area */}
        <div className={`flex-1 overflow-y-auto py-8 px-3 sm:px-4 md:px-6 space-y-4 ${
          isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'
        } transition-colors duration-200`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 pt-12">
              <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full ${
                isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
              } flex items-center justify-center mb-4 sm:mb-6`}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className={`text-xl md:text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              } text-center`}>
                How can I help you today?
              </h2>
              <p className={`text-center max-w-sm md:max-w-md ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } text-sm sm:text-base`}>
                Start a conversation with your AI Assistant. Ask anything or try out voice commands!
              </p>
            </div>
          ) : (
            messages
              .filter(msg => msg && ((msg.message && msg.message.trim() !== '') || msg.content))
              .map((msg, index) => {
                // Determine if message is from user
                const isFromUser = msg.sender === 'User' || 
                                msg.is_from_user ||
                                msg.sender === currentUser?.name;
                
                // Add extra top margin to the first message
                const isFirstMessage = index === 0;
                
                return (
                  <div 
                    key={msg.id || `msg-${index}`}
                    className={`flex mx-auto ${isFromUser ? 'justify-end' : 'justify-start'} max-w-full sm:max-w-[540px] md:max-w-[720px] lg:max-w-[900px] ${isFirstMessage ? 'mt-6' : ''}`}
                  >
                    {!isFromUser && (
                      <div className="flex flex-col max-w-[85%] sm:max-w-[80%]">
                        <div className="flex items-center mb-1.5">
                          <div className={`flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full ${
                            isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                          } flex items-center justify-center mr-2`}>
                            <span className="text-xs font-medium">
                              {team?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <span className={`text-xs sm:text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {team?.name || 'Assistant'}
                          </span>
                        </div>
                        <div className={`px-3 py-2 sm:px-4 sm:py-1 whitespace-pre-wrap text-sm break-words ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {msg.message || msg.content}
                        </div>
                        {msg.timestamp && (
                          <div className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {msg.timestamp?.toDate 
                              ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                              : msg.timestamp instanceof Date 
                                ? msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                : 'Now'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isFromUser && (
                      <div className="flex flex-col max-w-[85%] sm:max-w-[80%]">
                        <div className="flex items-center justify-end mb-1.5">
                          <span className={`text-xs sm:text-sm font-medium mr-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            You
                          </span>
                          <div className={`flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full ${
                            isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                          } flex items-center justify-center`}>
                            <span className="text-xs font-medium">
                              {currentUser?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className={`${
                          isDarkMode 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-primary-500 text-white'
                          } px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-sm whitespace-pre-wrap ml-auto text-sm break-words`}>
                          {msg.message || msg.content}
                        </div>
                        {msg.timestamp && (
                          <div className={`text-xs mt-1 text-right ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {msg.timestamp?.toDate 
                              ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                              : msg.timestamp instanceof Date 
                                ? msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                : 'Now'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
          
          {/* Agent thinking/processing animation */}
          {agentState.isProcessing && (
            <div className="flex max-w-3xl mx-auto">
              <div className={`${
                isDarkMode 
                  ? 'bg-dark-surface text-white border border-dark-border' 
                  : 'bg-white text-gray-800 border border-gray-200'
              } px-6 py-4 rounded-lg shadow-sm w-full md:w-4/5 lg:w-2/3`}>
                <div className="flex items-start mb-4">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full ${
                    isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                  } flex items-center justify-center mr-3`}>
                    <span className="text-xs font-medium">
                      {team?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {team?.name || 'AI Assistant'} is working...
                  </span>
                </div>
                
                {/* Show different animations based on processing phase */}
                {agentState.processingPhase === 0 && (
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faBrain} className={`w-5 h-5 mr-3 ${
                        isDarkMode ? 'text-primary-400' : 'text-primary-500'
                      } animate-pulse`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Thinking...</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
                      <div className={`${
                        isDarkMode ? 'bg-primary-500' : 'bg-primary-600'
                      } h-1.5 rounded-full animate-[progress_1.5s_ease-in-out_infinite]`} style={{width: '30%'}}></div>
                    </div>
                  </div>
                )}
                
                {agentState.processingPhase === 1 && (
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faCog} className={`w-5 h-5 mr-3 ${
                        isDarkMode ? 'text-primary-400' : 'text-primary-500'
                      } animate-spin`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Processing your request...</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
                      <div className={`${
                        isDarkMode ? 'bg-primary-500' : 'bg-primary-600'
                      } h-1.5 rounded-full animate-[progress_1.5s_ease-in-out_infinite]`} style={{width: '60%'}}></div>
                    </div>
                  </div>
                )}
                
                {agentState.processingPhase === 2 && (
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faRobot} className={`w-5 h-5 mr-3 ${
                        isDarkMode ? 'text-primary-400' : 'text-primary-500'
                      } animate-bounce`} />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Generating response...</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
                      <div className={`${
                        isDarkMode ? 'bg-primary-500' : 'bg-primary-600'
                      } h-1.5 rounded-full animate-[progress_1.5s_ease-in-out_infinite]`} style={{width: '90%'}}></div>
                    </div>
                  </div>
                )}
                
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {agentState.processingPhase === 0 ? 
                    "Analyzing your message and context..." : 
                    agentState.processingPhase === 1 ? 
                      "Searching for relevant information..." : 
                      "Crafting a helpful response..."}
                </div>
              </div>
            </div>
          )}
          
          {/* Simple typing indicator (after processing is done) */}
          {agentState.isTyping && !agentState.isProcessing && (
            <div className="flex max-w-3xl mx-auto">
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${
                  isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                } flex items-center justify-center mr-2`}>
                  <span className="text-xs font-medium">
                    {team?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className={`${
                  isDarkMode ? 'bg-dark-surface' : 'bg-white'
                } px-4 py-3 rounded-lg shadow-sm flex space-x-2`}>
                  <div className={`w-2 h-2 ${
                    isDarkMode ? 'bg-primary-400' : 'bg-primary-500'
                  } rounded-full animate-bounce`}></div>
                  <div className={`w-2 h-2 ${
                    isDarkMode ? 'bg-primary-400' : 'bg-primary-500'
                  } rounded-full animate-bounce delay-100`}></div>
                  <div className={`w-2 h-2 ${
                    isDarkMode ? 'bg-primary-400' : 'bg-primary-500'
                  } rounded-full animate-bounce delay-200`}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className={`p-4 border-t ${
          isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-200'
        } transition-colors duration-200`}>
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="relative rounded-lg shadow-sm">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message AI Assistant..."
                rows={1}
                className={`w-full rounded-lg border px-4 py-3 pr-16 resize-none focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-dark-elevated border-dark-border text-white placeholder:text-gray-500 focus:ring-primary-500/30 focus:border-primary-500/70' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:ring-primary-500/30 focus:border-primary-500'
                } transition-colors duration-200`}
                style={{
                  minHeight: '44px',
                  maxHeight: '200px',
                }}
              />
              
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={handleVoiceClick}
                  className={`p-1.5 rounded-md ${
                    isRecording 
                      ? 'text-red-500 bg-red-100 dark:bg-red-900/20' 
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-elevated'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  } transition-colors duration-200`}
                  title={isRecording ? "Stop recording" : "Record audio"}
                >
                  <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} className="w-4 h-4" />
                </button>
                
                {/* Attach file */}
                <label className={`p-1.5 rounded-md cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-elevated'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200`}
                title="Attach file"
                >
                  <FontAwesomeIcon icon={faPaperclip} className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                
                {/* Send button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-1.5 rounded-md ${
                    inputMessage.trim() && !isLoading
                      ? isDarkMode
                        ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20' 
                        : 'text-primary-500 hover:text-primary-600 hover:bg-primary-50'
                      : isDarkMode
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                  } transition-colors duration-200`}
                  title="Send message"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className={`text-xs mt-2 text-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              AI Assistant can make mistakes. Consider checking important information.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage; 