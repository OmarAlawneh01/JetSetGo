const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret key configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
module.exports = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const isTokenMissing = token === undefined;
        
        if (isTokenMissing) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        
        // Get user from database
        const user = await User.findById(userId).select('-password');
        const userNotFound = user === null;
        if (userNotFound) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 