import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Trash2, RefreshCcw, Star, User, Users, AlertTriangle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
// ADDED useLocation to retrieve the authentication token from the login state
import { useNavigate, useLocation } from 'react-router-dom';

// --- API Configuration ---
const API_BASE_URL = 'https://geolib.onrender.com';
const ADMIN_API_URL = `${API_BASE_URL}/admin`;
// -------------------------

const AdminDash = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access navigation state

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Retrieve the token from the navigation state, or use placeholder if accessed directly
    const initialToken = location.state?.authToken || 'YOUR_ADMIN_AUTH_TOKEN_HERE';
    const [adminToken, setAdminToken] = useState(initialToken);

    // --- Modal State for Custom Confirmation/Input ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({});
    const [modalInput, setModalInput] = useState('');

    // --- Utility Function for Notifications ---
    const showNotification = useCallback((message, isSuccess = true) => {
        if (isSuccess) {
            setSuccessMessage(message);
            setError('');
        } else {
            setError(message);
            setSuccessMessage('');
        }
        setTimeout(() => {
            setSuccessMessage('');
            setError('');
        }, 5000);
    }, []);

    // --- Modal Handlers (Replaces window.confirm/prompt) ---
    const openModal = ({ title, message, type, placeholder, initialValue, action }) => {
        setModalConfig({ title, message, type, placeholder, action, initialValue });
        setModalInput(initialValue || '');
        setIsModalOpen(true);
    };

    const handleModalSubmit = () => {
        setIsModalOpen(false);
        if (modalConfig.action) {
            // Pass input value if it's an input type, otherwise just execute
            if (modalConfig.type === 'input') {
                modalConfig.action(modalInput);
            } else {
                modalConfig.action();
            }
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setModalInput('');
    };

    // --- 1. Fetch All Users (GET /admin/users) ---
    const fetchUsers = useCallback(async () => {
        // If the token is the placeholder, block the call and show a warning.
        if (!adminToken || adminToken === 'YOUR_ADMIN_AUTH_TOKEN_HERE') {
            showNotification('Admin token not set. Please log in first.', false);
            setUsers([]);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${ADMIN_API_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
            });
            setUsers(response.data);
            showNotification('User list refreshed from database.', true);

        } catch (err) {
            console.error('Fetch Users Error:', err);
            const msg = err.response?.data?.error || 'Failed to fetch users. Check API endpoint and token.';
            showNotification(msg, false);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [adminToken, showNotification]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // Fetch users whenever the component loads or token changes

    // --- 2. Update Rating Core Logic (PUT /admin/users/:id/rating) ---
    const updateRating = async (userId, newRating) => {
        // Validation moved from modal input handler
        const ratingValue = parseFloat(newRating);
        if (isNaN(ratingValue) || ratingValue < 0) {
            showNotification('Invalid rating value. Must be a non-negative number.', false);
            return;
        }

        if (!adminToken || adminToken === 'YOUR_ADMIN_AUTH_TOKEN_HERE') {
            showNotification('API call skipped. Admin token is missing.', false);
            return;
        }

        try {
            const response = await axios.put(`${ADMIN_API_URL}/users/${userId}/rating`,
                { newRating: ratingValue },
                {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );

            if (response.status === 200) {
                // Update local state based on successful API response
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, rating: response.data.user.rating } : u));
                showNotification(`Rating for User ${userId} updated to ${response.data.user.rating.toFixed(2)}.`, true);
            }
        } catch (err) {
            console.error('Update Rating Error:', err);
            showNotification(err.response?.data?.error || `Failed to update rating for User ${userId}.`, false);
        }
    };

    // --- 3. Delete User Core Logic (DELETE /admin/users/:id) ---
    const deleteUser = async (userId, userName) => {
        if (!adminToken || adminToken === 'YOUR_ADMIN_AUTH_TOKEN_HERE') {
            showNotification('API call skipped. Admin token is missing.', false);
            return;
        }

        try {
            const response = await axios.delete(`${ADMIN_API_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
            });

            if (response.status === 200) {
                // Remove the user from the local state
                setUsers(prev => prev.filter(u => u.id !== userId));
                showNotification(`User ${userName} successfully deleted from database.`, true);
            }
        } catch (err) {
            console.error('Delete User Error:', err);
            showNotification(err.response?.data?.error || `Failed to delete user ${userName}.`, false);
        }
    };

    // --- 4. Handler Mappers (Trigger Modals) ---

    // Trigger Update Rating Input Modal
    const handleUpdateRating = (user) => {
        openModal({
            title: 'Update User Rating',
            message: `Set a new rating for user: ${user.name} (ID: ${user.id}). Current rating: ${user.rating.toFixed(2)}.`,
            type: 'input',
            placeholder: 'Enter new rating (e.g., 5.00)',
            initialValue: user.rating.toFixed(2),
            action: (newRating) => updateRating(user.id, newRating),
        });
    };

    // Trigger Reset Rating Confirmation Modal (Calls updateRating with 0)
    const handleResetRatingOverride = (user) => {
        openModal({
            title: 'Confirm Rating Reset',
            message: `Are you sure you want to reset the rating for user ${user.name} to 0.00?`,
            type: 'confirm',
            action: () => updateRating(user.id, 0),
        });
    };

    // Trigger Delete Confirmation Modal
    const handleDeleteUser = (user) => {
        openModal({
            title: 'Confirm User Deletion',
            message: `This action will permanently DELETE user: ${user.name} (ID: ${user.id}) from the database and cannot be undone.`,
            type: 'confirm',
            action: () => deleteUser(user.id, user.name),
        });
    };

    // --- Custom Modal Component (Inline for Single File) ---
    const Modal = ({ isOpen, config, input, setInput, onSubmit, onCancel }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">{config.title}</h3>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-4">{config.message}</p>

                        {config.type === 'input' && (
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={config.placeholder}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mt-2"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSubmit();
                                }}
                            />
                        )}
                    </div>
                    <div className="p-6 pt-0 flex justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-full transition ${config.type === 'input'
                                    ? 'bg-green-600 hover:bg-green-700' // Changed to green for Update
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {config.type === 'input' ? 'Save Rating' : 'Confirm Action'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-screen bg-gray-50 p-6 font-inter">

            <header className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
                <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                    <Users className="w-8 h-8 text-indigo-600 mr-3" />
                    ProxLib Admin Dashboard
                </h1>
                <button
                    onClick={() => {
                        // On Logout, clear the token and navigate back to admin login
                        setAdminToken('YOUR_ADMIN_AUTH_TOKEN_HERE');
                        navigate('/admin');
                    }}
                    className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 bg-red-100 px-3 py-2 rounded-lg transition"
                >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                </button>
            </header>

            {/* Notification Area */}
            {error && (
                <div className="flex items-center p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg shadow-md" role="alert">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="font-medium">{error}</span>
                </div>
            )}
            {successMessage && (
                <div className="flex items-center p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-lg shadow-md" role="alert">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">All Registered Users ({users.length})</h2>
                    <button
                        onClick={fetchUsers}
                        disabled={isLoading}
                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition duration-150"
                    >
                        <RefreshCcw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Loading...' : 'Refresh Data'}
                    </button>
                </div>

                {/* User Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">Username (Name)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-5/12">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                        No users found. Ensure you are logged in and the Admin Token is valid.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                                            <User className="w-4 h-4 mr-2 text-indigo-400" />
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                                            {/* Display rating formatted to 2 decimal places */}
                                            {typeof user.rating === 'number' ? user.rating.toFixed(2) : '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleUpdateRating(user)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none transition shadow-md"
                                                title="Set Custom Rating"
                                            >
                                                <Star className="w-4 h-4 mr-1" />
                                                Update Rating
                                            </button>
                                            <button
                                                onClick={() => handleResetRatingOverride(user)}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs leading-4 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-100 transition shadow-md"
                                                title="Reset Rating to 0"
                                            >
                                                <RefreshCcw className="w-4 h-4 mr-1" />
                                                Reset to 0
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-full text-white bg-red-500 hover:bg-red-600 focus:outline-none transition shadow-md"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete User
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Confirmation/Input Modal */}
            <Modal
                isOpen={isModalOpen}
                config={modalConfig}
                input={modalInput}
                setInput={setModalInput}
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
            />
        </div>
    );
};

export default AdminDash;