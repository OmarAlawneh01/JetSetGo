const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');

// Validation middleware for destination creation
const validateDestination = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('climate').isIn(['Tropical', 'Mediterranean', 'Desert', 'Temperate', 'Arctic', 'Continental'])
        .withMessage('Invalid climate type')
];

// Validation middleware for review creation
const validateReview = [
    body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required')
];

// Get all destinations with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            country,
            climate,
            minRating,
            maxPrice,
            tags,
            page = 1,
            limit = 10
        } = req.query;

        // Build filter query
        const filter = buildFilterQuery(country, climate, minRating, maxPrice, tags);

        // Execute query with pagination
        const { destinations, total } = await getPaginatedDestinations(filter, page, limit);

        // Return paginated response
        const paginationResponse = createPaginationResponse(destinations, total, page, limit);
        res.json(paginationResponse);
    } catch (error) {
        handleServerError(res, error);
    }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        const destinationNotFound = destination === null;
        if (destinationNotFound) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json(destination);
    } catch (error) {
        handleServerError(res, error);
    }
});

// Add new destination (protected route)
router.post('/', [auth, ...validateDestination], async (req, res) => {
    try {
        const errors = validationResult(req);
        const hasValidationErrors = !errors.isEmpty();
        if (hasValidationErrors) {
            return res.status(400).json({ errors: errors.array() });
        }

        const destination = new Destination(req.body);
        await destination.save();
        res.status(201).json(destination);
    } catch (error) {
        handleServerError(res, error);
    }
});

// Add review to destination (protected route)
router.post('/:id/reviews', [auth, ...validateReview], async (req, res) => {
    try {
        const errors = validationResult(req);
        const hasValidationErrors = !errors.isEmpty();
        if (hasValidationErrors) {
            return res.status(400).json({ errors: errors.array() });
        }

        const destination = await Destination.findById(req.params.id);
        const destinationNotFound = destination === null;
        if (destinationNotFound) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        // Create and add review
        const review = createReview(req.user.id, req.body.rating, req.body.comment);
        destination.reviews.push(review);
        
        // Update average rating
        updateDestinationRating(destination);

        await destination.save();
        res.json(destination);
    } catch (error) {
        handleServerError(res, error);
    }
});

// Update destination (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const destination = await Destination.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        res.json(destination);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete destination (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const destination = await Destination.findByIdAndDelete(req.params.id);
        const destinationNotFound = destination === null;
        if (destinationNotFound) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Helper functions
function buildFilterQuery(country, climate, minRating, maxPrice, tags) {
    const filter = {};
    if (country !== undefined) filter.country = new RegExp(country, 'i');
    if (climate !== undefined) filter.climate = climate;
    if (minRating !== undefined) filter.rating = { $gte: parseFloat(minRating) };
    if (maxPrice !== undefined) filter['averageCost.amount'] = { $lte: parseFloat(maxPrice) };
    if (tags !== undefined) filter.tags = { $in: tags.split(',') };
    return filter;
}

async function getPaginatedDestinations(filter, page, limit) {
    const destinations = await Destination.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ rating: -1 });

    const total = await Destination.countDocuments(filter);
    return { destinations, total };
}

function createPaginationResponse(destinations, total, page, limit) {
    return {
        destinations,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDestinations: total
    };
}

function createReview(userId, rating, comment) {
    return {
        user: userId,
        rating,
        comment
    };
}

function updateDestinationRating(destination) {
    const totalRating = destination.reviews.reduce((sum, review) => sum + review.rating, 0);
    destination.rating = totalRating / destination.reviews.length;
}

function handleServerError(res, error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
}

module.exports = router; 