import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, BookOpen, User, Clock, Mail } from 'lucide-react';

// --- Dummy Data Simulating Inbox Messages ---
// These messages are sent by other users regarding the books you listed in MyBooks.jsx.
const DUMMY_MESSAGES = [
  {
    id: 1,
    senderUsername: 'TechReader',
    bookTitle: 'Deep Learning with Python',
    content: 'Hi! I saw you listed this book. Is it the second edition, and would you be willing to meet up near the central library?',
    timestamp: '2024-05-20T10:30:00Z',
    status: 'unread',
  },
  {
    id: 2,
    senderUsername: 'SpaceLover',
    bookTitle: 'The Martian',
    content: 'I am highly interested in The Martian. Can you confirm the condition of the paperback? I can trade a copy of Project Hail Mary if you are looking for it.',
    timestamp: '2024-05-19T15:45:00Z',
    status: 'read',
  },
  {
    id: 3,
    senderUsername: 'ClassicFan',
    bookTitle: "The Hitchhiker's Guide to the Galaxy",
    content: 'Awesome classic! Is the cover art the original 1979 design? I’d like to arrange a pickup this week.',
    timestamp: '2024-05-18T09:00:00Z',
    status: 'read',
  },
  {
    id: 4,
    senderUsername: 'AlgoKing',
    bookTitle: 'Deep Learning with Python',
    content: 'Quick question on the Deep Learning book: Does it include the latest updates on TensorFlow 2.x? Thanks!',
    timestamp: '2024-05-17T18:10:00Z',
    status: 'unread',
  },
];

const MyMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(DUMMY_MESSAGES);

  const handleBack = () => {
    navigate('/dashboard'); // Navigate back to the main dashboard
  };

  const handleMarkAsRead = (id) => {
    // In a real app, this would update Firestore. Here, it updates local state.
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === id ? { ...msg, status: 'read' } : msg
      )
    );
  };

  /**
   * Handles navigation to the chat page when an incoming message is clicked.
   * Passes the sender's username as the 'lenderUsername' to reuse the existing ChatBox component.
   * @param {object} message The message object that was clicked.
   */
  const handleViewMessage = (message) => {
    // 1. Mark as read
    handleMarkAsRead(message.id);
    
    // 2. Navigate to the chat page, passing the required state.
    // We map the senderUsername to lenderUsername to keep the existing ChatBox happy.
    navigate('/chat', { state: {
        lenderUsername: message.senderUsername, 
        bookTitle: message.bookTitle,
        // Note: Location is omitted as it's not relevant/available for a received message
    }});
  };

  // Sort messages to show unread ones first, then by latest timestamp
  const sortedMessages = messages.sort((a, b) => {
    if (a.status === 'unread' && b.status === 'read') return -1;
    if (a.status === 'read' && b.status === 'unread') return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="min-h-screen w-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center pb-6 border-b border-indigo-200 mb-6">
        <div className="flex items-center">
          <MessageSquare className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">My Messages</h1>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center px-4 py-2 bg-gray-200 text-black text-sm font-medium rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Inbox ({messages.filter(m => m.status === 'unread').length} Unread)
        </h2>

        {sortedMessages.length > 0 ? (
          <div className="space-y-3">
            {sortedMessages.map(message => {
              const isUnread = message.status === 'unread';
              
              return (
                <div
                  key={message.id}
                  className={`p-4 rounded-xl shadow-lg cursor-pointer transition duration-150 ease-in-out ${
                    isUnread 
                      ? 'bg-white border-l-4 border-indigo-500 hover:bg-indigo-50' 
                      : 'bg-white border border-gray-200 hover:bg-gray-100'
                  }`}
                  // Updated onClick handler to pass the full message object
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="flex justify-between items-center mb-2 flex-wrap">
                    {/* Sender and Status */}
                    <div className="flex items-center space-x-2">
                        {isUnread && <Mail className="w-5 h-5 text-indigo-600" title="Unread Message" />}
                        <p className={`text-lg font-bold ${isUnread ? 'text-indigo-800' : 'text-gray-800'}`}>
                            {message.senderUsername}
                        </p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(message.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Book Title */}
                  <div className="flex items-center text-sm text-green-700 font-medium mb-2">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Regarding: {message.bookTitle}
                  </div>

                  {/* Message Snippet */}
                  <p className="text-gray-600 text-sm italic truncate">
                    {message.content}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Your Inbox is Empty</h3>
            <p className="mt-1 text-gray-500">No one has messaged you about your listed books yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyMessages;
