const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Password hashing configuration
const SALT_ROUNDS = 12; // Increased from 10 to 12 for better security
const PASSWORD_MIN_LENGTH = 8; // Increased minimum password length

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: PASSWORD_MIN_LENGTH,
        select: false // Password won't be returned in queries by default
    },
    bio: {
        type: String,
        default: ''
    },
    preferences: {
        travelStyle: [String],
        budget: {
            min: Number,
            max: Number
        },
        interests: [String],
        dietaryRestrictions: [String],
        accessibility: [String]
    },
    travelHistory: [{
        destination: String,
        date: Date,
        duration: Number,
        activities: [String]
    }],
    savedDestinations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Compare the provided password with the hashed password
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        // Log the error but don't expose it to the user
        console.error('Password comparison error:', error);
        return false;
    }
};

// Method to check if password meets requirements
userSchema.methods.isPasswordValid = function(password) {
    // Check minimum length
    if (password.length < PASSWORD_MIN_LENGTH) {
        return false;
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
        return false;
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
    }
    
    return true;
};

module.exports = mongoose.model('User', userSchema); 