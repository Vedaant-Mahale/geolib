import React, { useState } from 'react';
import { User, MapPin, X, BookOpen, LogOut, Navigation, MessageSquare } from 'lucide-react';

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
  // Each entry now represents a book available from a specific lender at a specific location
  { id: 1, title: 'The Silent Sea', lenderUsername: 'Alex_Reads', location: { x: 10.5, y: 5.1 } },
  { id: 2, title: 'Echoes of the Past', lenderUsername: 'JaneB_99', location: { x: 11.0, y: 6.0 } },
  { id: 3, title: 'Quantum Realms', lenderUsername: 'SciFi_Fanatic', location: { x: 12.0, y: 3.5 } },
  // This book is slightly further away
  { id: 4, title: 'Gardens of Mars', lenderUsername: 'GreenThumb', location: { x: 10.2, y: 5.3 } },
  { id: 5, title: 'The Last Alchemist', lenderUsername: 'MysteryLover', location: { x: 14.0, y: 8.0 } },
  { id: 6, title: 'A Thousand Suns', lenderUsername: 'StarGazer', location: { x: 11.3, y: 4.0 } },
];

/**
 * Dashboard Component (Simulates Dashboard.jsx for a P2P Library)
 * It displays books available from nearby users and allows filtering by simulated distance.
 * @param {function} navigate - Function to change the route/page (simulates useNavigate).
 */
const Dashboard = ({ navigate }) => {
  const [filterDistance, setFilterDistance] = useState(3.0); // Default filter: show books within 3.0 units

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
    // Logout navigates to the Auth page, simulating navigate('/')
    navigate('/');
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center pb-6 border-b border-indigo-200 mb-6">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Peer-to-Peer Book Exchange</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-150"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* User Location Info */}
        <div className="flex justify-center mb-6">
            <p className="text-sm font-medium text-gray-600 p-2 bg-yellow-100 rounded-lg flex items-center shadow-inner">
                <Navigation className="w-4 h-4 mr-2 text-yellow-700 transform rotate-45" />
                Your current (Simulated) Location: X: {USER_LOCATION.x}, Y: {USER_LOCATION.y}
            </p>
        </div>

        {/* Filter Control */}
        <div className="p-4 bg-white shadow-lg rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between border border-indigo-100">
          <div className="flex items-center mb-4 sm:mb-0">
            <MapPin className="w-6 h-6 text-indigo-500 mr-3" />
            <span className="text-lg font-semibold text-gray-700">Max Distance to Search:</span>
            <span className="ml-3 text-2xl font-bold text-indigo-600">{filterDistance.toFixed(2)} Kms</span>
          </div>

          <div className="w-full sm:w-1/2">
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={filterDistance}
              onChange={(e) => setFilterDistance(parseFloat(e.target.value))}
              className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
          </div>
        </div>

        {/* Book List */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{filteredData.length} Lenders Found</h2>
        {filteredData.length > 0 ? (
          <div className="space-y-4">
            {filteredData.map(book => (
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

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    {/* Peer-to-Peer Message */}
                    <p className="text-sm italic text-gray-700 bg-green-50 p-2 rounded-lg">
                        "Hey, I've got this book, we're close by!"
                    </p>

                    <button className="flex items-center px-3 py-1 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <X className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No Nearby Lenders Found</h3>
            <p className="mt-1 text-gray-500">Try increasing the search distance to find more books.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
