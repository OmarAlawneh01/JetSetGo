const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

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
        .custom(async (password) => {
            const user = new User();
            if (!user.isPasswordValid(password)) {
                throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            }
            return true;
        })
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

// Default user preferences
const defaultUserPreferences = {
    travelStyle: [],
    budget: { min: 0, max: 10000 },
    interests: [],
    dietaryRestrictions: [],
    accessibility: []
};

/**
 * Register a new user
 * تسجيل مستخدم جديد
 * @route POST /api/auth/register
 * @access Public
 */
router.post('/register', validateRegistration, async (req, res) => {
    try {
        // Validate input data
        // التحقق من صحة بيانات الإدخال
        const errors = validationResult(req);
        const hasValidationErrors = !errors.isEmpty();
        if (hasValidationErrors) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, preferences } = req.body;

        // Check if user already exists
        // التحقق مما إذا كان المستخدم موجودًا بالفعل
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        const userExists = existingUser !== null;
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' }); // المستخدم موجود بالفعل
        }

        // Create new user with default preferences if none provided
        // إنشاء مستخدم جديد بتفضيلات افتراضية إذا لم يتم تقديم أي تفضيلات
        const newUser = new User({
            username,
            email,
            password,
            preferences: preferences || defaultUserPreferences
        });

        await newUser.save();

        // Generate JWT token
        // إنشاء رمز JWT
        const token = generateJWTToken(newUser._id);

        // Return user data without sensitive information
        const userResponse = createUserResponse(newUser, token);
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Registration error:', error);
        handleServerError(res, error, 'Error registering user:');
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
        // Validate input data
        // التحقق من صحة بيانات الإدخال
        const errors = validationResult(req);
        const hasValidationErrors = !errors.isEmpty();
        if (hasValidationErrors) {
            console.log('Login validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user and validate credentials
        // البحث عن المستخدم والتحقق من صحة بيانات الاعتماد
        const user = await User.findOne({ email }).select('+password');
        const userNotFound = user === null;
        if (userNotFound) {
            console.log('Login failed: user not found for email', email);
            return res.status(400).json({ message: 'Invalid credentials' }); // بيانات اعتماد غير صالحة
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Login failed: invalid password for email', email);
            return res.status(400).json({ message: 'Invalid credentials' }); // بيانات اعتماد غير صالحة
        }

        // Generate JWT token
        // إنشاء رمز JWT
        const token = generateJWTToken(user._id);

        // Return user data without sensitive information
        const userResponse = createUserResponse(user, token);
        res.json(userResponse);
    } catch (error) {
        console.error('Login error:', error);
        handleServerError(res, error, 'Error logging in:');
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

/**
 * Get current user data
 * الحصول على بيانات المستخدم الحالي
 * @route GET /api/auth/me
 * @access Private
 */
router.get('/me', async (req, res) => {
    try {
        // Get and validate token
        // الحصول على الرمز والتحقق من صحته
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const isTokenMissing = token === undefined;
        if (isTokenMissing) {
            return res.status(401).json({ message: 'No token, authorization denied' }); // لا يوجد رمز، تم رفض التفويض
        }

        // Verify token and get user ID
        // التحقق من الرمز والحصول على بيانات المستخدم
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        // Find user
        const user = await User.findById(userId).select('-password');
        const userNotFound = user === null;
        if (userNotFound) {
            return res.status(404).json({ message: 'User not found' }); // لم يتم العثور على المستخدم
        }

        // Return user data
        res.json(createUserResponse(user));
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(401).json({ message: 'Token is not valid' }); // الرمز غير صالح
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