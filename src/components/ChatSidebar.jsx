import React from 'react';

export function ChatSidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  chats = [], 
  currentChatId, 
  onChatSelect, 
  onNewChat 
}) {
  const formatChatDate = (date) => {
    if (!date) return '';
    
    try {
      // For Firestore timestamps
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleString();
      }
      
      // For JavaScript Date objects
      if (date instanceof Date) {
        return date.toLocaleString();
      }
      
      // For string dates
      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleString();
        }
      }
      
      return 'Recent';
    } catch (error) {
      console.error('Error formatting chat date:', error);
      return 'Recent';
    }
  };

  return (
    <div className={`fixed top-0 left-0 h-full transition-all duration-300 z-10 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 ${
      isCollapsed ? 'w-14' : 'w-64 md:w-80'
    }`}>
      {/* Collapse toggle button with updated styling */}
      <div className="absolute -right-3 top-20 z-20">
        <button 
          onClick={onToggleCollapse}
          className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Header with title */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        {!isCollapsed && (
          <h2 className="font-semibold text-gray-800 dark:text-white">Recent Chats</h2>
        )}
        {isCollapsed && (
          <svg className="w-6 h-6 text-gray-500 dark:text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </div>

      {/* Chat list - only shown when not collapsed */}
      {!isCollapsed && (
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          {chats.length > 0 ? (
            <div className="py-2">
              {chats.map((chat) => {
                const chatId = chat?.id?.toString() || `chat-${Math.random()}`;
                
                return (
                  <button
                    key={chatId}
                    onClick={() => onChatSelect(chat.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-2 transition-colors ${
                      currentChatId === chat.id 
                        ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.title || "Untitled Chat"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                          <span className="truncate max-w-[120px]">{chat.lastMessage || "No messages"}</span>
                          <span>{formatChatDate(chat.lastMessageAt || chat.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No conversations yet</p>
              <button 
                className="mt-4 px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-1 transition-colors"
                onClick={onNewChat}
              >
                Start a new chat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 