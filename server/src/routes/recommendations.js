const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');

// Helper function to normalize user preferences
const normalizePreferences = (preferences) => {
    const normalized = {
        travelStyle: preferences.travelStyle || [],
        budget: preferences.budget || { min: 0, max: 10000 },
        interests: preferences.interests || [],
        dietaryRestrictions: preferences.dietaryRestrictions || [],
        accessibility: preferences.accessibility || []
    };
    return normalized;
};

// Get personalized recommendations
router.get('/', auth, async (req, res) => {
    try {
        // For now, just return some sample destinations
        const destinations = await Destination.find().limit(10);
        res.json(destinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get seasonal recommendations
router.get('/seasonal', auth, async (req, res) => {
    try {
        const destinations = await Destination.find().limit(10);
        res.json(destinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get budget-based recommendations
router.get('/budget', auth, async (req, res) => {
    try {
        const destinations = await Destination.find().limit(10);
        res.json(destinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 