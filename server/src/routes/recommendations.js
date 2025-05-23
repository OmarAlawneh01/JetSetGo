const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');
const OpenAI = require('openai');

// Use OpenAI API key from environment variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
router.post('/personalized', auth, async (req, res) => {
    try {
        const { categories, budget } = req.body;
        
        // Create a prompt for OpenAI
        const promptText = `Recommend 6 travel destinations based on these preferences:
        Categories: ${categories.join(', ')}
        Budget: $${budget}
        
        For each destination, provide:
        1. City and Country
        2. Why it's recommended for these categories
        3. Estimated cost for a week
        4. Best time to visit
        
        Format each recommendation as:
        City, Country - Reason - Cost - Best Time`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: promptText
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const aiContent = completion.choices[0].message.content;

        // Parse the AI response into structured recommendations
        const recommendations = aiContent.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [location, reason, cost, bestTime] = line.split(' - ').map(part => part.trim());
                const [city, country] = location.split(',').map(part => part.trim());
                return {
                    city,
                    country,
                    reason,
                    cost,
                    bestTime
                };
            });

        res.json({ recommendations });
    } catch (error) {
        console.error('AI recommendation error:', error);
        res.status(500).json({ message: 'Failed to generate recommendations' });
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

// AI-powered recommendations endpoint
router.post('/ai', auth, async (req, res) => {
    try {
        const preferences = req.body.preferences;
        const promptText = `Recommend 6 travel destination countries based on this user preference: "${preferences}". Respond in this format: 1. Country - Why it's recommended.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: promptText
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const aiContent = completion.choices[0].message.content;

        // Parse the AI response into card objects
        const cardArray = [];
        const lines = aiContent.split('\n').filter(line => line.trim());
        for (const line of lines) {
            // Match lines like: 1. Country - Reason
            const match = line.match(/^\d+\.\s*([^\-–—]+)[\-–—]\s*(.+)$/);
            if (match) {
                cardArray.push({
                    country: match[1].trim(),
                    reason: match[2].trim()
                });
            }
        }

        // Return the parsed recommendations or the raw content if parsing fails
        if (cardArray.length > 0) {
            res.json({ recommendations: cardArray });
        } else {
            res.json({ recommendations: aiContent });
        }
    } catch (error) {
        console.error('AI recommendation error:', error);
        res.status(500).json({ message: 'AI recommendation error' });
    }
});

module.exports = router;