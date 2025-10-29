import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, BookOpen, MapPin, User, Info } from 'lucide-react';

const CURRENT_USER_ID = 'CurrentUser'; // Simulating your unique user ID

// --- Chat Message Structure ---
// role: 'user' (you) or 'lender' (the person you are talking to)
// text: the message content

const ChatBoxComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Extract navigation state data
  const { lenderUsername, location: lenderLocation, bookTitle, isIncomingChat } = location.state || {};

  // Define initial message as an empty array, allowing the user to initiate the conversation
  // without any default, pre-filled messages.
  const INITIAL_MESSAGES = []; 

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  // Scrolls to the bottom of the chat window whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Log details on page load (as requested earlier)
  useEffect(() => {
    if (lenderUsername && bookTitle) {
      console.log('--- Chat Page Loaded ---');
      console.log('Chat Partner:', lenderUsername);
      console.log('Book Title:', bookTitle);
      console.log('Chat Context:', isIncomingChat ? 'Incoming (You are the Lender)' : 'Outgoing (You are the Borrower)');
      if (lenderLocation) {
        console.log('Lender Location (X, Y):', lenderLocation.x, lenderLocation.y);
      }
      console.log('------------------------');
    }
    scrollToBottom();
  }, [lenderUsername, bookTitle, lenderLocation, isIncomingChat]);

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
    
    // Auto-reply simulation code has been removed.
  };

  if (!lenderUsername || !bookTitle) {
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
    <div className="min-h-screen w-screen flex flex-col bg-gray-100">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-md sticky top-0 z-10 border-b border-indigo-200">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button 
                onClick={() => isIncomingChat ? navigate('/mymessages') : navigate('/dash')}
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
                title="Go Back"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back</span>
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
                        <MapPin className="w-4 h-4 mr-1" />
                        Loc: {lenderLocation.x},{lenderLocation.y}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => {
          const isMe = message.role === CURRENT_USER_ID;
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-md px-4 py-2 rounded-xl shadow-md text-white ${
                  isMe
                    ? 'bg-indigo-600 rounded-br-none'
                    : 'bg-green-600 rounded-tl-none'
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-80">{isMe ? 'You' : message.role}</p>
                <p className="break-words">{message.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white p-4 border-t border-gray-200 sticky bottom-0 z-10">
        <form onSubmit={handleSend} className="flex max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Start chatting with ${lenderUsername}...`}
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 outline-none"
            aria-label="Type your message"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-r-lg shadow-md hover:bg-indigo-700 transition duration-150 flex items-center justify-center"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBoxComponent;
