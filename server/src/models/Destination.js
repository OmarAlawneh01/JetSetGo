const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Destination name is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    averageCost: {
        amount: {
            type: Number,
            required: [true, 'Cost amount is required']
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    bestTimeToVisit: {
        type: String,
        enum: ['Spring', 'Summer', 'Fall', 'Winter'],
        required: [true, 'Best time to visit is required']
    },
    tags: [{
        type: String,
        trim: true
    }],
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    images: [{
        url: String,
        caption: String
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

// Update timestamp middleware
destinationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create indexes for better query performance
destinationSchema.index({ city: 1, country: 1 }, { unique: true });
destinationSchema.index({ rating: -1 });
destinationSchema.index({ tags: 1 });

module.exports = mongoose.model('Destination', destinationSchema); 
