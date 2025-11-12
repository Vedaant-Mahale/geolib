const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a new router instance
const router = express.Router();

// PostgreSQL connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// --- Middleware to verify admin JWT token (REMOVED as per user request) ---
// ⚠️ WARNING: Token authentication has been removed. All administrative routes are now publicly accessible.
const bypassAuth = (req, res, next) => {
    // SECURITY WARNING: Token authentication has been removed as per user request.
    // All routes are now publicly accessible.
    next();
};


// ----------------------------------------------------------------
// --- 1. Admin Login API (Targets 'admin' table) ---
// ----------------------------------------------------------------
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Admin name and password required' });
    }

    try {
        // Find admin user in the 'admin' table
        const result = await pool.query('SELECT * FROM admin WHERE name = $1', [name]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const user = result.rows[0];

        // Compare password hash securely using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Create JWT (Keeping the logic, but the token is now ignored by the client for dashboard access)
        const token = jwt.sign(
            { id: user.id, name: user.name, role: 'admin' }, // Ensure 'role: admin' is in payload
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Response object includes id and token, matching the frontend expectation
        res.status(200).json({ message: 'Admin login successful', userid: user.id, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Admin login failed' });
    }
});


// ----------------------------------------------------------------
// --- 2. ADMIN ROUTES (NO AUTHENTICATION REQUIRED) ---
// ----------------------------------------------------------------

// GET /admin/users - Fetch all users for the dashboard
router.get('/users', bypassAuth, async (req, res) => {
    try {
        // Select id, name, and rating from the 'auth' table. Order by ID for consistency.
        const result = await pool.query('SELECT id, name, rating FROM auth ORDER BY id ASC');

        // FIX: Convert rating from string (due to numeric type) to float
        const users = result.rows.map(user => ({
            ...user,
            // Ensure rating is explicitly a float, handling null/undefined safely
            rating: user.rating !== null && user.rating !== undefined ? parseFloat(user.rating) : 0
        }));

        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

// PUT /admin/users/:id/rating - Update a user's rating
router.put('/users/:id/rating', bypassAuth, async (req, res) => {
    const { id } = req.params;
    const { newRating } = req.body;

    // Input validation: ensure rating is a non-negative number
    if (newRating === undefined || isNaN(parseFloat(newRating)) || parseFloat(newRating) < 0) {
        return res.status(400).json({ error: 'Valid positive numeric rating required' });
    }

    try {
        // Update the rating column (numeric(10,2) in the DB)
        const result = await pool.query(
            'UPDATE auth SET rating = $1 WHERE id = $2 RETURNING id, name, rating',
            [parseFloat(newRating).toFixed(2), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = result.rows[0];

        // FIX: Convert the returned rating from string to float before sending to client
        updatedUser.rating = parseFloat(updatedUser.rating);

        res.status(200).json({ message: 'Rating updated successfully', user: updatedUser });
    } catch (err) {
        console.error(`Error updating rating for user ${id}:`, err);
        res.status(500).json({ error: 'Failed to update rating' });
    }
});

// DELETE /admin/users/:id - Delete a user
router.delete('/users/:id', bypassAuth, async (req, res) => {
    const { id } = req.params;

    try {
        // The CASCADE constraint on `user_profile` will delete related rows automatically.
        const result = await pool.query('DELETE FROM auth WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: `User ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting user ${id}:`, err);
        // Specific error handling for foreign key constraint violation (if cascade fails)
        if (err.code === '23503') {
            return res.status(500).json({ error: 'Cannot delete user due to existing data dependencies.' });
        }
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Export the router
module.exports = router;