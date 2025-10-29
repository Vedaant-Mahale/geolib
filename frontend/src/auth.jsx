import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LogIn, Library, X } from 'lucide-react';

// Hardcoded credentials needed for login logic
const CORRECT_USERNAME = 'user@library.com';
const CORRECT_PASSWORD = 'password123';


const Auth = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
                navigate('/dash');
            } else {
                setError('Invalid username or password. Try user@library.com / password123');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center w-screen justify-center min-h-screen bg-gray-100 p-4">
            <div className="max-w-md p-8 bg-white shadow-xl rounded-xl transition duration-300 hover:shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <Library className="w-12 h-12 text-indigo-600 mb-3" />
                    <h1 className="text-3xl font-extrabold text-gray-900">ProxLib Online Library</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to find books near you.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                id="username"
                                type="email"
                                placeholder="user@library.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                required
                            />
                            <LogIn className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                placeholder="password123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
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
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
