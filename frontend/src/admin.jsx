import React, { useState } from 'react';
import { LogIn, Library, X } from 'lucide-react';
import axios from 'axios';
// Note: Using switch case or props for routing since full router libraries 
// are typically not available in the single-file environment, but 
// maintaining the useNavigate signature as requested.
import { useNavigate } from "react-router-dom";

// --- API Configuration ---
// The explicit base URL for your Render application.
const API_BASE_URL = 'https://geolib.onrender.com';
const ADMIN_LOGIN_URL = `${API_BASE_URL}/admin/login`;
// -------------------------

const Admin = () => {
    // This component only handles login, so no isLoginView state is needed.
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Sending request to the new /admin/login endpoint
            console.log(username);
            console.log(password);
            const response = await axios.post(ADMIN_LOGIN_URL, {
                name: username,
                password: password,
            });

            // Handle successful response (assuming 200 for successful login)
            if (response.status === 200) {
                const { token, userid } = response.data;

                // Navigate to the administrator dashboard
                navigate('/admindash', {
                    state: {
                        authToken: token,
                        userId: userid
                    }
                });

            } else {
                // Should not happen for 2xx codes but good for robustness
                setError('Login failed with an unknown response.');
            }

        } catch (err) {
            // Handle errors from the server (401, 500, etc.)
            console.error('API Error:', err.response ? err.response.data : err.message);

            let errorMessage = 'An unexpected error occurred. Please try again.';

            if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error;
            } else if (err.response && err.response.status === 401) {
                errorMessage = 'Invalid admin credentials.';
            } else if (err.response && err.response.status === 500) {
                errorMessage = 'Server error. Could not connect to the database.';
            }

            setError(errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    const Icon = LogIn; // Only the login icon is needed

    return (
        <div className="flex flex-col items-center w-screen justify-center min-h-screen bg-gray-100 p-4 font-inter">
            <div className="max-w-md p-8 bg-white shadow-xl rounded-xl transition duration-300 hover:shadow-2xl w-full">
                <div className="flex flex-col items-center mb-6">
                    <Library className="w-12 h-12 text-red-600 mb-3" />
                    <h1 className="text-3xl font-extrabold text-gray-900">ProxLib Admin Portal</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sign in using your administrator credentials.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                            Admin Username
                        </label>
                        <div className="relative">
                            <input
                                id="username"
                                type="email"
                                placeholder="admin@proxadmin.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                            <X className="w-4 h-4 mr-2" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <Icon className="mr-2 h-5 w-5" />
                                {'Admin Sign In'}
                            </>
                        )}
                    </button>
                </form>

                {/* Information block */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    Access restricted to system administrators.
                </div>

                {/* --- NEW USER LOGIN BUTTON --- */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                    >
                        &larr; Back to User Login / Register
                    </button>
                </div>
                {/* ------------------------------ */}
            </div>
        </div>
    );
};

export default Admin;