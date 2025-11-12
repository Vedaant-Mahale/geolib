const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const cors = require("cors");
require('dotenv').config();

// 1. Import the authentication routers
const authRoutes = require('./auth.js');
const adminAuthRoutes = require('./admin_auth.js'); // Import the admin router

const app = express();
app.use(express.json());
// Allowing connections from the specified Render URL
app.use(cors({
  origin: "https://geolib.onrender.com",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));
const PORT = process.env.PORT || 3000;

// PostgreSQL connection (Kept here for the initial test connection logging)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test DB connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch(err => console.error('❌ Database connection error:', err.stack));

// 2. Mount the regular user auth router under the '/auth' path
// Routes: /auth/register, /auth/login
app.use('/auth', authRoutes);

// 3. Mount the admin auth router under a separate '/admin' path
// Route: /admin/login
app.use('/admin', adminAuthRoutes);

// Static files for the frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route for the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});