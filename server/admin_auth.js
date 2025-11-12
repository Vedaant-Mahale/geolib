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

// --- Admin Login API (Targets 'admin' table) ---
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

        // Compare password hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, name: user.name, role: 'admin' }, // Added 'role: admin' to the payload
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

// Export the router
module.exports = router;