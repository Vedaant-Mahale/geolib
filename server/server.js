const express = require('express');
const path = require('path');
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "https://geolib.onrender.com" }));
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
