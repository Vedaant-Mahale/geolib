import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

// Initial dummy data for the books the user is listing
const INITIAL_MY_BOOKS = [
  { 
    id: 101, 
    title: 'Deep Learning with Python', 
    author: 'Francois Chollet', 
    description: 'A practical introduction to deep learning using the Keras library and Python.', 
    dateOfManufacture: '2017-11-20', 
    specialFeatures: ['Hardcover', 'Latest Edition'] 
  },
  { 
    id: 102, 
    title: 'The Martian', 
    author: 'Andy Weir', 
    description: 'An astronaut is stranded on Mars and must rely on his ingenuity to find a way to signal to Earth that he has survived.', 
    dateOfManufacture: '2014-02-11', 
    specialFeatures: ['Slight creases', 'Paperback'] 
  },
  { 
    id: 103, 
    title: 'The Hitchhiker\'s Guide to the Galaxy', 
    author: 'Douglas Adams', 
    description: 'The story follows the misadventures of the last surviving man after the demolition of the Earth.', 
    dateOfManufacture: '1979-10-12', 
    specialFeatures: ['First US Edition', 'Fair Condition'] 
  },
];

const MyBooks = () => {
  const navigate = useNavigate();
  // State to manage the list of books the user has available for lending
  const [myBooks, setMyBooks] = useState(INITIAL_MY_BOOKS);
  // State to manage the input fields for a new book
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    dateOfManufacture: '',
    specialFeatures: '', // Comma-separated string in the form
  });

  // Handles updates to form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  // Handles adding a new book to the list
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) {
      console.error("Title and Author are required.");
      return; // Basic validation
    }

    // Convert comma-separated string of features into an array
    const featuresArray = newBook.specialFeatures
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const bookToAdd = {
      ...newBook,
      id: Date.now(), // Use timestamp for unique ID (better to use Firestore IDs in a real app)
      specialFeatures: featuresArray,
    };

    setMyBooks(prev => [...prev, bookToAdd]);
    // Reset form fields
    setNewBook({
      title: '',
      author: '',
      description: '',
      dateOfManufacture: '',
      specialFeatures: '',
    });
  };

  // Handles deleting a book from the list
  const handleDeleteBook = (id) => {
    setMyBooks(prev => prev.filter(book => book.id !== id));
  };

  const handleBack = () => {
    navigate('/dash'); // Navigate back to the main dashboard
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center pb-6 border-b border-indigo-200 mb-6">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">My Listed Books</h1>
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
        {/* Section to Add a New Book */}
        <div className="p-6 bg-white shadow-xl rounded-xl mb-8 border-t-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
            <PlusCircle className="w-5 h-5 mr-2" /> List a New Book
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <input
              type="text"
              name="title"
              placeholder="Book Title (Required)"
              value={newBook.title}
              onChange={handleInputChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            {/* Author */}
            <input
              type="text"
              name="author"
              placeholder="Author (Required)"
              value={newBook.author}
              onChange={handleInputChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            {/* Manufacture Date */}
            <input
              type="date"
              name="dateOfManufacture"
              placeholder="Date of Manufacture"
              value={newBook.dateOfManufacture}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            {/* Special Features */}
            <input
              type="text"
              name="specialFeatures"
              placeholder="Special Features (e.g., Hardcover, Signed Copy)"
              value={newBook.specialFeatures}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              title="Separate features with commas"
            />
            {/* Description */}
            <textarea
              name="description"
              placeholder="Detailed description of the book/condition"
              value={newBook.description}
              onChange={handleInputChange}
              rows="3"
              className="md:col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none"
            />
            
            {/* Submit Button */}
            <button
              type="submit"
              className="md:col-span-2 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.01]"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              List Book for Exchange
            </button>
          </form>
        </div>

        {/* Current Books Listing */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{myBooks.length} Books You Are Listing</h2>
        
        {myBooks.length > 0 ? (
          <div className="space-y-4">
            {myBooks.map(book => (
              <div
                key={book.id}
                className="p-5 bg-white rounded-xl shadow-md border-l-4 border-indigo-500 flex justify-between items-start"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
                  <p className="text-sm text-indigo-600 font-medium mb-2">By: {book.author}</p>
                  <p className="text-sm text-gray-700 italic mb-3">{book.description}</p>
                  
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold">Manufactured:</span> {book.dateOfManufacture || 'N/A'}
                    <span className="mx-2">•</span>
                    <span className="font-semibold">Features:</span> {book.specialFeatures.join(', ') || 'None'}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBook(book.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition duration-150 shadow-sm flex-shrink-0"
                  title="Remove Book"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <BookOpen className="w-10 h-10 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">You are not listing any books.</h3>
            <p className="mt-1 text-gray-500">Use the form above to add a book!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBooks;
