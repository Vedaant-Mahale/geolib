import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Send, ArrowLeft, BookOpen, MapPin, User, Info, MessageSquare } from 'lucide-react';

// --- Global Constants (Must be available in the environment) ---
// Note: In a real app, these would come from an Auth Context.
const CURRENT_USER_ID = 'User_12345'; 

const ChatBox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Extract navigation state data
  const { lenderUsername, location: lenderLocation, bookTitle, isIncomingChat, initialMessageContent } = location.state || {};
  
  // The username of the person you are chatting with
  const OTHER_USER_ID = lenderUsername; 

  /**
   * Determines the initial state of the messages based on chat context.
   * @param {string} bookTitle - Title of the book.
   * @param {string} otherUsername - Username of the chat partner.
   * @param {boolean} isIncomingChat - True if the current user received the first message.
   * @param {string} content - The content of the initial message, if available (from MyMessages).
   * @returns {Array} An array of initial message objects.
   */
  const getInitialMessages = (bookTitle, otherUsername, isIncomingChat, content) => {
    // Case 1: Incoming chat (from MyMessages)
    // The first message is sent by the OTHER user.
    if (isIncomingChat && content) {
        return [{
            id: 1,
            role: otherUsername, // Sender is the other user (Lender/Borrower)
            text: content,
        }];
    } 
    
    // Case 2: Outgoing chat (from Dashboard) - Default message, sent by the CURRENT user.
    // The default message is set to "Do you want my book?" + book context.
    if (!isIncomingChat && bookTitle) {
         return [{
            id: 1,
            role: CURRENT_USER_ID, // Sender is 'You'
            text: `Do you want my book? I'm interested in borrowing "${bookTitle}".`,
        }];
    }

    // Default empty state if context is incomplete or ambiguous
    return [];
  };
  
  // Initialize state using the dynamic helper function
  const [messages, setMessages] = useState(
      getInitialMessages(bookTitle, OTHER_USER_ID, isIncomingChat, initialMessageContent)
  );
  
  const [input, setInput] = useState('');

  // Scrolls to the bottom of the chat window whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Log details on page load and initial scroll
  useEffect(() => {
    // Scroll on initial load to show the latest messages/prompt
    scrollToBottom();
  }, [lenderUsername, bookTitle, isIncomingChat, initialMessageContent]); 

  // Scroll on message update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      role: CURRENT_USER_ID, // Current user is always the sender
      text: input.trim(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  if (!lenderUsername || !bookTitle) {
    // Error screen if essential context is missing
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center">
          <Info className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-xl font-semibold text-gray-800">Error: Missing Chat Context</p>
          <p className="text-gray-600 mt-2">Please navigate from the Dashboard or My Messages page.</p>
          <button onClick={() => navigate('/dash')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-100 font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-xl sticky top-0 z-10 border-b-4 border-indigo-400">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button 
                onClick={() => navigate(isIncomingChat ? '/mymessages' : '/dash')}
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition p-2 rounded-lg hover:bg-indigo-50"
                title="Go Back"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline font-medium">Back</span>
            </button>

            <div className="text-center flex-1 mx-4">
                <p className="font-bold text-lg text-gray-800 flex items-center justify-center">
                    <User className="w-5 h-5 mr-2 text-indigo-500" />
                    Chatting with {lenderUsername}
                </p>
                <p className="text-sm text-gray-600 flex items-center justify-center mt-1">
                    <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                    Regarding: <span className="font-medium ml-1 truncate max-w-[200px]">{bookTitle}</span>
                </p>
            </div>
            
            <div className="w-16">
                {lenderLocation && (
                    <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1 text-red-400" />
                        Loc: {lenderLocation.x},{lenderLocation.y}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => {
          // Check if the message was sent by the current user
          const isMe = message.role === CURRENT_USER_ID;
          // Use the lenderUsername for the other user's name display
          const senderName = isMe ? 'You' : lenderUsername; 

          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-md px-4 py-3 rounded-xl shadow-lg transition duration-200 ${
                  isMe
                    ? 'bg-indigo-600 rounded-br-none text-white'
                    : 'bg-white rounded-tl-none text-gray-800 border border-gray-200'
                }`}
              >
                <p className={`text-xs font-bold mb-1 ${isMe ? 'text-indigo-100' : 'text-green-600'}`}>
                  {senderName}
                </p>
                <p className="break-words">{message.text}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
             <div className="text-center text-gray-500 pt-10">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                <p className="font-semibold">Start a conversation with {lenderUsername}!</p>
                <p className="text-sm">Type your first message below to borrow the book.</p>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white p-4 border-t border-gray-300 sticky bottom-0 z-10 shadow-inner">
        <form onSubmit={handleSend} className="flex max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Type a reply to ${lenderUsername}...`}
            className="flex-1 p-3 border-2 border-gray-200 rounded-l-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 outline-none shadow-inner"
            aria-label="Type your message"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-r-xl shadow-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
            title="Send Message"
            disabled={input.trim() === ''}
          >
            <Send className="w-5 h-5 mr-2 sm:mr-0" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox