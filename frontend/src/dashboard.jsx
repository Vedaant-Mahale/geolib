import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 💡 Added useLocation
import { User, MapPin, X, BookOpen, LogOut, Navigation, MessageSquare, Info, ChevronDown } from 'lucide-react';

// Hardcoded user location (Simulated GPS coordinates for your account)
const USER_LOCATION = { x: 10, y: 5 }; // Our current coordinates

// --- Utility Function for Distance Calculation ---
/**
 * Calculates the Euclidean distance (using Pythagorean theorem) between two points.
 * Distance = sqrt((x1 - x2)^2 + (y1 - y2)^2)
 */
const calculateDistance = (userLoc, libraryLoc) => {
  const dx = userLoc.x - libraryLoc.x;
  const dy = userLoc.y - libraryLoc.y;
  // Note: distance is returned as a unit (simulated miles/km)
  return Math.sqrt(dx * dx + dy * dy);
};
// ---------------------------------------------------

// Dummy data simulating books available from individual lenders (1 copy available per lender)
const DUMMY_LENDER_DATA = [
  // Expanded data with author, description, manufacture date, and special features
  { id: 1, title: 'The Silent Sea', lenderUsername: 'Alex_Reads', location: { x: 10.5, y: 5.1 }, author: 'Ava Chen', description: 'A thrilling nautical mystery set 50 years in the future, dealing with deep-sea survival and ecological disaster.', dateOfManufacture: '2021-03-15', specialFeatures: ['Signed Copy', 'First Edition'] },
  { id: 2, title: 'Echoes of the Past', lenderUsername: 'JaneB_99', location: { x: 11.0, y: 6.0 }, author: 'Dr. Elias Thorne', description: 'A historical text and deep dive into ancient Sumerian civilizations and their forgotten magic systems.', dateOfManufacture: '2019-11-01', specialFeatures: ['Hardcover', 'Includes map insert'] },
  { id: 3, title: 'Quantum Realms', lenderUsername: 'SciFi_Fanatic', location: { x: 12.0, y: 3.5 }, author: 'Leo Maxwell', description: 'Theoretical physics meets parallel dimensions in this mind-bending adventure about multiverses.', dateOfManufacture: '2023-07-20', specialFeatures: ['Digital Bookmark Link', 'Excellent Condition'] },
  { id: 4, title: 'Gardens of Mars', lenderUsername: 'GreenThumb', location: { x: 10.2, y: 5.3 }, author: 'Seraphina Reed', description: 'A beautiful exploration of early human efforts in terraforming and botany on the red planet.', dateOfManufacture: '2018-05-10', specialFeatures: ['Slightly water damaged', 'Paperback'] },
  { id: 5, title: 'The Last Alchemist', lenderUsername: 'MysteryLover', location: { x: 14.0, y: 8.0 }, author: 'Victor Sterling', description: 'A gripping historical fiction novel about a secretive alchemical society in Renaissance Florence.', dateOfManufacture: '2015-09-25', specialFeatures: ['Leather-bound', 'Collector\'s Edition', 'Rare'] },
  { id: 6, title: 'A Thousand Suns', lenderUsername: 'StarGazer', location: { x: 11.3, y: 4.0 }, author: 'Maya Singh', description: 'Epic space opera spanning three galaxies and featuring multiple alien races struggling for power.', dateOfManufacture: '2022-01-01', specialFeatures: ['Mint Condition', 'Dust Jacket Included'] },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 💡 Hook to read the state passed via navigate

  // --- 💡 Authentication State Initialization ---
  // Read the passed state once. If state is null (e.g., on refresh), authToken/userId will be undefined.
  const { authToken, userId } = location.state || {};

  // Store the auth details in component state
  const [currentUserId, setCurrentUserId] = useState(userId);
  const [userToken, setUserToken] = useState(authToken);

  // ---------------------------------------------

  const [filterDistance, setFilterDistance] = useState(3.0);
  const [inputDistance, setInputDistance] = useState('3.0');
  const [expandedBookId, setExpandedBookId] = useState(null);

  // --- 💡 Auth Guard Effect ---
  // This effect runs once to check if we received an auth token.
  // If not, it redirects the user back to the login page.
  useEffect(() => {
    if (!userToken) {
      // Note: In a real app, this would display a custom modal message first.
      console.warn('Unauthorized access: Authentication token missing. Redirecting to login.');
      navigate('/', { replace: true });
    }
  }, [userToken, navigate]);


  // 1. Calculate the distance for all books dynamically
  const booksWithDistance = DUMMY_LENDER_DATA.map(book => {
    const distance = calculateDistance(USER_LOCATION, book.location);
    return { ...book, distance }; // Attach calculated distance to book object
  });

  // 2. Filter and sort the data based on the calculated distance
  const filteredData = booksWithDistance
    .filter(book => book.distance <= filterDistance)
    .sort((a, b) => a.distance - b.distance); // Sort by closest distance

  const handleLogout = () => {
    // Clear auth state (though it will be lost on navigate anyway)
    setUserToken(null);
    setCurrentUserId(null);
    // Logout navigates to the Auth page, simulating navigate('/')
    navigate('/');
  };

  // Toggles the expansion state for a given book ID
  const handleInfoToggle = (id) => {
    setExpandedBookId(id === expandedBookId ? null : id);
  };

  /**
   * Handles navigation to the chat page, passing lender details as state.
   */
  const handleMessageClick = (book) => {
    navigate('/chat', {
      state:
      {
        lenderUsername: book.lenderUsername,
        location: book.location,
        bookTitle: book.title
      }
    });
  };

  /**
   * Handles the submission of the distance filter input field.
   */
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(inputDistance);
    const MIN_DISTANCE = 0.1;
    const MAX_DISTANCE = 5.0;

    if (!isNaN(value) && value >= MIN_DISTANCE && value <= MAX_DISTANCE) {
      setFilterDistance(value);
      // Ensure the input field always displays the actual applied value (rounded to one decimal)
      setInputDistance(value.toFixed(1));
    } else {
      console.error(`Invalid distance entered. Please use a number between ${MIN_DISTANCE.toFixed(1)} and ${MAX_DISTANCE.toFixed(1)}.`);
      // Revert input field to show the currently applied filter distance if input was invalid
      setInputDistance(filterDistance.toFixed(1));
    }
  };

  // If the token is not available *yet* (during the first render before the redirect effect runs), render a loading/error state.
  if (!userToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-medium text-gray-700">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center pb-6 border-b border-indigo-200 mb-6">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800 hidden sm:block">Peer-to-Peer Book Exchange</h1>
          <h1 className="text-xl font-bold text-gray-800 sm:hidden">P2P Exchange</h1>
        </div>

        {/* Navigation and Logout Buttons */}
        <div className="flex space-x-2">
          {/* My Books Button */}
          <button
            onClick={() => navigate('/mybooks')}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            title="My Books"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">My Books</span>
          </button>

          {/* My Messages Button */}
          <button
            onClick={() => navigate('/mymessages')}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            title="My Messages"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Messages</span>
          </button>

          {/* Logout Button (Existing) */}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 bg-gray-200 text-black text-sm font-medium rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* User Info & Location Info */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
          {/* 💡 User ID Display */}
          <div className="p-2 bg-indigo-50 rounded-lg flex items-center shadow-inner text-sm text-indigo-700 font-semibold w-full sm:w-auto justify-center sm:justify-start">
            <User className="w-4 h-4 mr-2" />
            Logged in as User ID: <code className="ml-1 font-mono">{currentUserId}</code>
          </div>

          {/* User Location Info */}
          <p className="text-sm font-medium text-gray-600 p-2 bg-yellow-100 rounded-lg flex items-center shadow-inner w-full sm:w-auto justify-center sm:justify-start">
            <Navigation className="w-4 h-4 mr-2 text-yellow-700 transform rotate-45" />
            Your current (Simulated) Location: X: {USER_LOCATION.x}, Y: {USER_LOCATION.y}
          </p>
        </div>

        {/* Filter Control - Updated to use text input and button */}
        <div className="p-4 bg-white shadow-lg rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between border border-indigo-100">
          <div className="flex items-center mb-4 sm:mb-0">
            <MapPin className="w-6 h-6 text-indigo-500 mr-3" />
            <span className="text-lg font-semibold text-gray-700">Max Distance to Search:</span>
            <span className="ml-3 text-2xl font-bold text-indigo-600">{filterDistance.toFixed(2)} Kms</span>
            <span className="text-sm text-gray-500 ml-2">(Max 5.0 Kms)</span>
          </div>

          {/* Input Field and Enter Button */}
          <form onSubmit={handleFilterSubmit} className="flex space-x-2 w-full sm:w-1/2">
            <input
              type="number"
              min="0.1"
              max="5.0"
              step="0.1"
              value={inputDistance}
              onChange={(e) => setInputDistance(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
              placeholder="Enter Max Distance (0.1 - 5.0)"
              aria-label="Enter maximum search distance in kilometers"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              Enter
            </button>
          </form>
        </div>

        {/* Book List */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{filteredData.length} Lenders Found</h2>
        {filteredData.length > 0 ? (
          <div className="space-y-4">
            {filteredData.map(book => {
              const isExpanded = expandedBookId === book.id;

              return (
                <div
                  key={book.id}
                  className="p-5 bg-white rounded-xl shadow-md border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>

                      {/* Lender Username Display */}
                      <p className="text-sm text-gray-600 mt-1 flex items-center font-semibold">
                        <User className="w-4 h-4 mr-2 text-green-600" />
                        Lender: {book.lenderUsername}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-indigo-700">{book.distance.toFixed(2)} Kms</p>
                      <p className="text-xs font-medium text-indigo-500">Distance Calculated</p>
                    </div>
                  </div>

                  {/* Buttons and P2P Message Section */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center flex-wrap gap-2">
                    {/* Peer-to-Peer Message */}
                    <p className="text-sm italic text-gray-700 bg-green-50 p-2 rounded-lg order-2 w-full sm:order-none sm:w-auto">
                      "Hey, I've got this book, we're close by!"
                    </p>

                    <div className="flex space-x-2 order-1 sm:order-0">
                      {/* Info Button */}
                      <button
                        onClick={() => handleInfoToggle(book.id)}
                        className={`flex items-center px-3 py-1 text-sm font-medium rounded-lg transition duration-150 shadow-md ${isExpanded
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                          }`}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4 mr-1 transform rotate-180" /> : <Info className="w-4 h-4 mr-1" />}
                        {isExpanded ? 'Hide Info' : 'Info'}
                      </button>

                      {/* Message Button - Now calls handleMessageClick to navigate and pass state */}
                      <button
                        onClick={() => handleMessageClick(book)}
                        className="flex items-center px-3 py-1 bg-white text-black text-sm font-medium rounded-lg transition duration-150 shadow-md border border-gray-300 hover:bg-gray-100"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Panel (Conditionally Rendered) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-indigo-100 bg-indigo-50 p-4 rounded-lg transition-all duration-300 ease-in-out">
                      <h4 className="text-lg font-bold text-indigo-800 mb-2">Book Details</h4>
                      <p className="text-sm text-gray-700 mb-3">{book.description}</p>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-semibold text-gray-800">Author:</div>
                        <div className="text-gray-600">{book.author}</div>

                        <div className="font-semibold text-gray-800">Manufactured:</div>
                        <div className="text-gray-600">{book.dateOfManufacture}</div>

                        <div className="font-semibold text-gray-800">Features:</div>
                        <div className="text-gray-600">
                          {book.specialFeatures.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <X className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No Nearby Lenders Found</h3>
            <p className="mt-1 text-gray-500">Try increasing the search distance to find more books.</p>
          </div>
        )}
      </main>
      <footer className="pt-4 text-center text-xs text-gray-500">
        <p>Data is simulated and distances are calculated using Euclidean distance from a hardcoded user location (X: {USER_LOCATION.x}, Y: {USER_LOCATION.y}).</p>
        <p className="mt-1">Auth Token (for debug): {userToken ? userToken.substring(0, 30) + '...' : 'N/A'}</p>
      </footer>
    </div>
  );
};

export default Dashboard;