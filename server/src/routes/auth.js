const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Validation middleware for registration
const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .custom(async (password) => {
            const user = new User();
            if (!user.isPasswordValid(password)) {
                throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            }
            return true;
        })
];

// Validation middleware for login
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .exists()
        .withMessage('Password is required')
];

// Default user preferences
const defaultUserPreferences = {
    travelStyle: [],
    budget: { min: 0, max: 10000 },
    interests: [],
    dietaryRestrictions: [],
    accessibility: []
};

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        const hasValidationErrors = !errors.isEmpty();
        if (hasValidationErrors) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, preferences } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        const userExists = existingUser !== null;
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with default preferences if none provided
        const newUser = new User({
            username,
            email,
            password,
            preferences: preferences || defaultUserPreferences
        });

        await newUser.save();

        // Generate JWT token
        const token = generateJWTToken(newUser._id);

        // Return user data without sensitive information
        const userResponse = createUserResponse(newUser, token);
        res.status(201).json(userResponse);
    } catch (error) {
        handleServerError(res, error);
    }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        const hasValidationErrors = !errors.isEmpty();
        if (hasValidationErrors) {
            console.log('Login validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user and validate credentials
        const user = await User.findOne({ email }).select('+password');
        const userNotFound = user === null;
        if (userNotFound) {
            console.log('Login failed: user not found for email', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Login failed: invalid password for email', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateJWTToken(user._id);

        // Return user data without sensitive information
        const userResponse = createUserResponse(user, token);
        res.json(userResponse);
    } catch (error) {
        console.error('Login error:', error);
        handleServerError(res, error);
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        // Get and validate token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const isTokenMissing = token === undefined;
        if (isTokenMissing) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        // Find user
        const user = await User.findById(userId);
        const userNotFound = user === null;
        if (userNotFound) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields if provided
        const { username, email, bio, travelPreferences, password } = req.body;
        const shouldUpdateUsername = username !== undefined;
        const shouldUpdateEmail = email !== undefined;
        const shouldUpdateBio = bio !== undefined;
        const shouldUpdatePreferences = travelPreferences !== undefined;
        const shouldUpdatePassword = password !== undefined;
        
        if (shouldUpdateUsername) user.username = username;
        if (shouldUpdateEmail) user.email = email;
        if (shouldUpdateBio) user.bio = bio;
        
        if (shouldUpdatePreferences) {
            user.preferences = {
                ...user.preferences,
                ...travelPreferences
            };
        }

        // Handle password update with validation
        if (shouldUpdatePassword) {
            if (!user.isPasswordValid(password)) {
                return res.status(400).json({ 
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                });
            }
            user.password = password;
        }

        await user.save();

        // Return updated user data
        const userResponse = createUserResponse(user);
        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        handleServerError(res, error, 'Error updating profile:');
    }
});

// Get current user data
router.get('/me', async (req, res) => {
    try {
        // Get and validate token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const isTokenMissing = token === undefined;
        if (isTokenMissing) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        // Find user
        const user = await User.findById(userId).select('-password');
        const userNotFound = user === null;
        if (userNotFound) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user data
        res.json(createUserResponse(user));
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
});

// Helper functions
function generateJWTToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
}

function createUserResponse(user, token = null) {
    const response = {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        preferences: user.preferences,
        createdAt: user.createdAt
    };

    if (token) {
        response.token = token;
    }

    return response;
}

function handleServerError(res, error, message = '') {
    console.error(message, error);
    res.status(500).json({ message: 'Server error' });
}

module.exports = router;