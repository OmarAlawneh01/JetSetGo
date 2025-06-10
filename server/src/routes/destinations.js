const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');
const getCityPhotoUrl = require('../utils/unsplash');

/**
 * Validation middleware for destination creation
 * وسيط التحقق من صحة إنشاء الوجهة
 */
const validateDestination = [
    body('name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'), // يجب أن يكون الاسم 3 أحرف على الأقل
    body('country')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Country must be at least 2 characters long'), // يجب أن يكون اسم البلد حرفين على الأقل
    body('description')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'), // يجب أن يكون الوصف 10 أحرف على الأقل
    body('rating')
        .isFloat({ min: 0, max: 5 })
        .withMessage('Rating must be between 0 and 5') // يجب أن تكون التقييم بين 0 و 5
];

/**
 * Get all destinations with optional filtering
 * الحصول على جميع الوجهات مع إمكانية التصفية
 * @route GET /api/destinations
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const { country, sort = '-rating' } = req.query;
        
        // Build query
        // بناء الاستعلام
        const query = {};
        if (country) {
            query.country = new RegExp(country, 'i');
        }

        // Execute query with sorting
        // تنفيذ الاستعلام مع الترتيب
        const destinations = await Destination.find(query)
            .sort(sort)
            .populate('reviews.user', 'username');

        res.json(destinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

/**
 * Get destination by ID
 * الحصول على الوجهة بواسطة المعرف
 * @route GET /api/destinations/:id
 * @access Public
 */
router.get('/:id', async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id)
            .populate('reviews.user', 'username');

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' }); // لم يتم العثور على الوجهة
        }

        res.json(destination);
    } catch (error) {
        console.error('Error fetching destination:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

/**
 * Add new destination
 * إضافة وجهة جديدة
 * @route POST /api/destinations
 * @access Private (Admin only)
 */
router.post('/', auth, validateDestination, async (req, res) => {
    try {
        // Validate input
        // التحقق من صحة الإدخال
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, country, description, rating } = req.body;

        // Get city photo from Unsplash
        // الحصول على صورة المدينة من Unsplash
        const photoUrl = await getCityPhotoUrl(name, country);

        // Create new destination
        // إنشاء وجهة جديدة
        const destination = new Destination({
            name,
            country,
            description,
            rating,
            photoUrl,
            addedBy: req.user._id
        });

        await destination.save();
        res.status(201).json(destination);
    } catch (error) {
        console.error('Error creating destination:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

/**
 * Update destination
 * تحديث الوجهة
 * @route PUT /api/destinations/:id
 * @access Private (Admin only)
 */
router.put('/:id', auth, validateDestination, async (req, res) => {
    try {
        // Validate input
        // التحقق من صحة الإدخال
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' }); // لم يتم العثور على الوجهة
        }

        // Update fields
        // تحديث الحقول
        const { name, country, description, rating } = req.body;
        destination.name = name;
        destination.country = country;
        destination.description = description;
        destination.rating = rating;

        // Update photo if name or country changed
        // تحديث الصورة إذا تغير الاسم أو البلد
        if (name !== destination.name || country !== destination.country) {
            destination.photoUrl = await getCityPhotoUrl(name, country);
        }

        await destination.save();
        res.json(destination);
    } catch (error) {
        console.error('Error updating destination:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

/**
 * Delete destination
 * حذف الوجهة
 * @route DELETE /api/destinations/:id
 * @access Private (Admin only)
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' }); // لم يتم العثور على الوجهة
        }

        await destination.remove();
        res.json({ message: 'Destination deleted' }); // تم حذف الوجهة
    } catch (error) {
        console.error('Error deleting destination:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

module.exports = router; 