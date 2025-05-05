const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        url: String,
        caption: String
    }],
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    climate: {
        type: String,
        enum: ['Tropical', 'Mediterranean', 'Desert', 'Temperate', 'Arctic', 'Continental']
    },
    bestTimeToVisit: [String],
    averageCost: {
        currency: String,
        amount: Number,
        period: String
    },
    attractions: [{
        name: String,
        description: String,
        type: String,
        rating: Number
    }],
    accommodations: [{
        name: String,
        type: String,
        priceRange: {
            min: Number,
            max: Number
        },
        rating: Number
    }],
    activities: [{
        name: String,
        description: String,
        duration: String,
        priceRange: {
            min: Number,
            max: Number
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Moderate', 'Challenging', 'Expert']
        }
    }],
    tags: [String],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
destinationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Destination', destinationSchema); 