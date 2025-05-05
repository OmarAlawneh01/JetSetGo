const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');

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
        const filter = {};
        if (country) filter.country = new RegExp(country, 'i');
        if (climate) filter.climate = climate;
        if (minRating) filter.rating = { $gte: parseFloat(minRating) };
        if (maxPrice) filter['averageCost.amount'] = { $lte: parseFloat(maxPrice) };
        if (tags) filter.tags = { $in: tags.split(',') };

        // Execute query with pagination
        const destinations = await Destination.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ rating: -1 });

        // Get total count for pagination
        const total = await Destination.countDocuments(filter);

        res.json({
            destinations,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalDestinations: total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json(destination);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new destination (protected route)
router.post('/', [
    auth,
    body('name').trim().notEmpty(),
    body('country').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('climate').isIn(['Tropical', 'Mediterranean', 'Desert', 'Temperate', 'Arctic', 'Continental'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const destination = new Destination(req.body);
        await destination.save();
        res.status(201).json(destination);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add review to destination (protected route)
router.post('/:id/reviews', [
    auth,
    body('rating').isFloat({ min: 0, max: 5 }),
    body('comment').trim().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        const review = {
            user: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        };

        destination.reviews.push(review);
        
        // Update average rating
        const totalRating = destination.reviews.reduce((sum, review) => sum + review.rating, 0);
        destination.rating = totalRating / destination.reviews.length;

        await destination.save();
        res.json(destination);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 