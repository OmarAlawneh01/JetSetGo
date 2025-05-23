// IMPORTANT: Run this server from the project root (JetSetGo-main), not from the server/ directory.
// Example: cd .. && npm start --prefix server
// This ensures dotenv loads the correct .env file from the project root.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env in project root
dotenv.config();

// Debug environment variables
console.log('MONGODB_URI:', process.env.MONGODB_URI  ? '***' : 'Not set');
console.log('PORT:', process.env.PORT || 5002);

// MongoDB connection configuration
// IMPORTANT: Your .env MONGODB_URI must include the database name, e.g. ...mongodb.net/jetsetgo
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in your .env file. Please add it and restart the server.');
    process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection (no deprecated options)
mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB');
    // Start server only after database connection
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/accommodations', require('./routes/accommodations'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/recommendations', require('./routes/recommendations'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});