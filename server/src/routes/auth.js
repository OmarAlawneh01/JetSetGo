const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Validation middleware for user registration
 * وسيط التحقق من صحة تسجيل المستخدم
 */
const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'), // اسم المستخدم يجب أن يكون 3 أحرف على الأقل
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'), // يرجى تقديم بريد إلكتروني صالح
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long') // كلمة المرور يجب أن تكون 8 أحرف على الأقل
];

/**
 * Validation middleware for user login
 * وسيط التحقق من صحة تسجيل الدخول
 */
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'), // يرجى تقديم بريد إلكتروني صالح
    body('password')
        .exists()
        .withMessage('Password is required') // كلمة المرور مطلوبة
];

/**
 * Register a new user
 * تسجيل مستخدم جديد
 * @route POST /api/auth/register
 * @access Public
 */
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();

        // Generate JWT token
        const token = generateJWTToken(newUser._id);

        // Return user data without sensitive information
        const userResponse = createUserResponse(newUser, token);
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Login user
 * تسجيل دخول المستخدم
 * @route POST /api/auth/login
 * @access Public
 */
router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateJWTToken(user._id);

        // Return user data without sensitive information
        const userResponse = createUserResponse(user, token);
        res.json(userResponse);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get current user
 * الحصول على بيانات المستخدم الحالي
 * @route GET /api/auth/me
 * @access Private
 */
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userResponse = createUserResponse(user);
        res.json(userResponse);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Update user profile
 * تحديث معلومات المستخدم
 * @route PUT /api/auth/profile
 * @access Private
 */
router.put('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, email, bio, password } = req.body;
        
        if (username) user.username = username;
        if (email) user.email = email;
        if (bio) user.bio = bio;
        if (password) user.password = password;

        await user.save();

        const userResponse = createUserResponse(user);
        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

function generateJWTToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
}

function createUserResponse(user, token = null) {
    const response = {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt
    };

    if (token) {
        response.token = token;
    }

    return response;
}

module.exports = router;
