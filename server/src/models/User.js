const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * نموذج المستخدم
 * Defines the structure and validation rules for user data
 * يحدد هيكل وقواعد التحقق من صحة بيانات المستخدم
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'], // اسم المستخدم مطلوب
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'] // يجب أن يكون اسم المستخدم 3 أحرف على الأقل
    },
    email: {
        type: String,
        required: [true, 'Email is required'], // البريد الإلكتروني مطلوب
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'] // يرجى تقديم بريد إلكتروني صالح
    },
    password: {
        type: String,
        required: [true, 'Password is required'], // كلمة المرور مطلوبة
        minlength: [8, 'Password must be at least 8 characters long'], // يجب أن تكون كلمة المرور 8 أحرف على الأقل
        select: false // Don't include password in queries by default // لا تقم بتضمين كلمة المرور في الاستعلامات افتراضيًا
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot be more than 500 characters'] // لا يمكن أن يتجاوز السيرة الذاتية 500 حرف
    },
    preferences: {
        travelStyle: [String], // أنماط السفر
        budget: {
            min: { type: Number, default: 0 }, // الحد الأدنى للميزانية
            max: { type: Number, default: 10000 } // الحد الأقصى للميزانية
        },
        interests: [String], // الاهتمامات
        dietaryRestrictions: [String], // القيود الغذائية
        accessibility: [String] // إمكانية الوصول
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
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save middleware to hash password
 * وسيط ما قبل الحفظ لتشفير كلمة المرور
 * Automatically hashes the password before saving
 * يقوم بتشفير كلمة المرور تلقائيًا قبل الحفظ
 */
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Update timestamp middleware
 * وسيط تحديث الطابع الزمني
 * Updates the updatedAt field before saving
 * يقوم بتحديث حقل updatedAt قبل الحفظ
 */
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

/**
 * Password validation method
 * طريقة التحقق من صحة كلمة المرور
 * Validates password complexity
 * يتحقق من تعقيد كلمة المرور
 */
userSchema.methods.isPasswordValid = function(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

/**
 * Password comparison method
 * طريقة مقارنة كلمة المرور
 * Compares provided password with hashed password
 * يقارن كلمة المرور المقدمة مع كلمة المرور المشفرة
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * Create indexes for better query performance
 * إنشاء فهارس لأداء استعلام أفضل
 */
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema); 