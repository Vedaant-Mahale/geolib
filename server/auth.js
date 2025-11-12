// auth.js
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

// --- Register User API (Modified to return only id) ---
router.post('/register', async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password required' });
    }
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Changed RETURNING id, name to just RETURNING id
        const result = await pool.query(
            'INSERT INTO auth (name, password) VALUES ($1, $2) RETURNING id', // 💡 Only return id
            [name, hashedPassword]
        );

        // Modified response object to only include user id
        res.status(201).json({ message: 'User registered', userid: result.rows[0].id });
    } catch (err) {
        console.error(err);
        // Check for unique constraint violation
        if (err.code === '23505') {
            return res.status(409).json({ error: 'User with this name already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

// --- Login User API (Modified to return only id and token) ---
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password required' });
    }

    try {
        // Find user
        const result = await pool.query('SELECT * FROM auth WHERE name = $1', [name]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT (Note: The JWT payload *still* contains ID and name, which is good practice)
        const token = jwt.sign(
            { id: user.id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Modified response object to only include id and token
        res.status(200).json({ message: 'Login successful', userid: user.id, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Export the router
module.exports = router;