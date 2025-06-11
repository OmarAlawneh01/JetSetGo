const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');
const OpenAI = require('openai');
const { getCityPhotoUrl } = require('../utils/unsplash');
const User = require('../models/User');

// Use OpenAI API key from environment variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Get personalized travel recommendations
 * الحصول على توصيات سفر مخصصة
 * @route GET /api/recommendations
 * @access Private
 */
router.get('/', auth, async (req, res) => {
    try {
        // Get user preferences
        // الحصول على تفضيلات المستخدم
        const user = await User.findById(req.user._id);
        const { preferences } = user;

        // Build recommendation query based on user preferences
        // بناء استعلام التوصيات بناءً على تفضيلات المستخدم
        const query = {
            rating: { $gte: 4 }, // Only highly rated destinations // وجهات ذات تقييم عالي فقط
            'averageCost.amount': {
                $gte: preferences.budget.min,
                $lte: preferences.budget.max
            }
        };

        // Add travel style filter if specified
        // إضافة فلتر نمط السفر إذا تم تحديده
        if (preferences.travelStyle && preferences.travelStyle.length > 0) {
            query.tags = { $in: preferences.travelStyle };
        }

        // Get recommended destinations
        // الحصول على الوجهات الموصى بها
        const recommendations = await Destination.find(query)
            .sort({ rating: -1 })
            .limit(10);

        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

/**
 * Get seasonal recommendations
 * الحصول على توصيات موسمية
 * @route GET /api/recommendations/seasonal
 * @access Public
 */
router.get('/seasonal', async (req, res) => {
    try {
        // Get current month
        // الحصول على الشهر الحالي
        const currentMonth = new Date().getMonth() + 1;

        // Determine season based on month
        // تحديد الموسم بناءً على الشهر
        let season;
        if (currentMonth >= 3 && currentMonth <= 5) {
            season = 'Spring'; // ربيع
        } else if (currentMonth >= 6 && currentMonth <= 8) {
            season = 'Summer'; // صيف
        } else if (currentMonth >= 9 && currentMonth <= 11) {
            season = 'Fall'; // خريف
        } else {
            season = 'Winter'; // شتاء
        }

        // Get seasonal destinations
        // الحصول على الوجهات الموسمية
        const seasonalDestinations = await Destination.find({
            'bestTimeToVisit': season,
            rating: { $gte: 4 }
        })
        .sort({ rating: -1 })
        .limit(5);

        res.json(seasonalDestinations);
    } catch (error) {
        console.error('Error getting seasonal recommendations:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

/**
 * Get trending destinations
 * الحصول على الوجهات الرائجة
 * @route GET /api/recommendations/trending
 * @access Public
 */
router.get('/trending', async (req, res) => {
    try {
        // Get destinations with most reviews in the last month
        // الحصول على الوجهات التي لديها أكبر عدد من المراجعات في الشهر الماضي
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const trendingDestinations = await Destination.find({
            'reviews.createdAt': { $gte: oneMonthAgo }
        })
        .sort({ 'reviews.length': -1 })
        .limit(5);

        res.json(trendingDestinations);
    } catch (error) {
        console.error('Error getting trending destinations:', error);
        res.status(500).json({ message: 'Server error' }); // خطأ في الخادم
    }
});

// Get personalized recommendations
router.post('/personalized', auth, async (req, res) => {
    try {
        const { categories, budget } = req.body;
        console.log('Received request with:', { categories, budget });
        
        // Create a prompt for OpenAI
        const promptText = `You are a travel expert. Recommend EXACTLY 6 travel destinations based on these preferences:
        Categories: ${categories.join(', ')}
        Budget: $${budget}
        
        For each destination, provide:
        1. City and Country
        2. Why it's recommended for these categories
        3. Estimated cost for a week (include the currency symbol and amount)
        4. Best time to visit (specific months or seasons)
        
        IMPORTANT: 
        1. You MUST provide EXACTLY 6 recommendations
        2. Format each recommendation EXACTLY as shown below, using the pipe character (|) as a separator
        3. Each recommendation should be on a new line
        4. Do not include any additional text or explanations
        
        Format:
        City, Country | Reason | Cost | Best Time
        
        Example:
        Paris, France | Perfect for art and culture lovers | $2000 per week | April to June and September to October
        Tokyo, Japan | Ideal for modern city experiences | $2500 per week | March to May and September to November
        Rome, Italy | Rich in history and architecture | $1800 per week | April to June and September to October
        Barcelona, Spain | Great for food and beach lovers | $1700 per week | May to June and September
        Amsterdam, Netherlands | Perfect for art and cycling | $1900 per week | April to May and September
        Prague, Czech Republic | Beautiful architecture and affordable | $1500 per week | May to September`;

        console.log('Sending prompt to OpenAI:', promptText);

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a travel expert. Always provide exactly 6 recommendations in the specified format."
                },
                {
                    role: "user",
                    content: promptText
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const aiContent = completion.choices[0].message.content;
        console.log('Raw AI Response:', aiContent);

        // Parse the AI response into structured recommendations
        const recommendations = await Promise.all(
            aiContent.split('\n')
                .filter(line => line.trim() && line.includes('|')) // Only process lines with pipe character
                .map(async line => {
                    console.log('Processing line:', line);
                    
                    // Split by pipe character and trim each part
                    const parts = line.split('|').map(part => part.trim());
                    console.log('Split parts:', parts);
                    
                    if (parts.length < 4) {
                        console.log('Invalid line format:', line);
                        return null;
                    }

                    const [location, reason, cost, bestTime] = parts;
                    const [city, country] = location.split(',').map(part => part.trim());
                    
                    // Validate the data
                    if (!city || !country || !reason || !cost || !bestTime) {
                        console.log('Missing required data:', { city, country, reason, cost, bestTime });
                        return null;
                    }

                    console.log('Extracted data:', { city, country, reason, cost, bestTime });
                    
                    const photoUrl = await getCityPhotoUrl(city, country);
                    console.log('Photo URL for', city, ':', photoUrl);

                    const recommendation = {
                        city,
                        country,
                        reason,
                        cost: cost || 'Not specified',
                        bestTime: bestTime || 'Not specified',
                        photoUrl: photoUrl || `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},${encodeURIComponent(country)}`,
                        details: {
                            rating: Math.floor(Math.random() * 3) + 3,
                            priceLevel: Math.floor(Math.random() * 3) + 1
                        }
                    };

                    console.log('Created recommendation:', recommendation);
                    return recommendation;
                })
                .filter(rec => rec !== null)
        );

        // Ensure we have exactly 6 recommendations
        if (recommendations.length < 6) {
            console.log('Not enough recommendations, adding fallback destinations');
            const fallbackDestinations = [
                {
                    city: 'Bali',
                    country: 'Indonesia',
                    reason: 'Perfect for beach lovers and cultural experiences',
                    cost: '$1500 per week',
                    bestTime: 'April to October',
                    photoUrl: 'https://source.unsplash.com/800x600/?bali,indonesia',
                    details: { rating: 4, priceLevel: 2 }
                },
                {
                    city: 'Bangkok',
                    country: 'Thailand',
                    reason: 'Great for food and cultural experiences',
                    cost: '$1200 per week',
                    bestTime: 'November to February',
                    photoUrl: 'https://source.unsplash.com/800x600/?bangkok,thailand',
                    details: { rating: 4, priceLevel: 1 }
                },
                {
                    city: 'Dubai',
                    country: 'UAE',
                    reason: 'Perfect for luxury shopping and modern experiences',
                    cost: '$2500 per week',
                    bestTime: 'November to March',
                    photoUrl: 'https://source.unsplash.com/800x600/?dubai,uae',
                    details: { rating: 5, priceLevel: 3 }
                }
            ];

            // Add fallback destinations until we have 6
            while (recommendations.length < 6) {
                const fallbackIndex = recommendations.length % fallbackDestinations.length;
                recommendations.push(fallbackDestinations[fallbackIndex]);
            }
        }

        console.log('Final recommendations:', recommendations);
        res.json({ recommendations: recommendations });
    } catch (error) {
        console.error('AI recommendation error:', error);
        res.status(500).json({ message: 'Failed to generate recommendations' });
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