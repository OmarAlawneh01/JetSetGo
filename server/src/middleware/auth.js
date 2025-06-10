const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * وسيط المصادقة
 * Verifies JWT token and attaches user to request object
 * يتحقق من رمز JWT ويربط المستخدم بكائن الطلب
 * 
 * @param {Object} req - Express request object // كائن طلب Express
 * @param {Object} res - Express response object // كائن استجابة Express
 * @param {Function} next - Express next middleware function // دالة وسيط Express التالية
 */
module.exports = async (req, res, next) => {
    try {
        // Get token from Authorization header
        // الحصول على الرمز من رأس التفويض
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        // Check if token exists
        // التحقق من وجود الرمز
        if (!token) {
            return res.status(401).json({ 
                message: 'No token, authorization denied' // لا يوجد رمز، تم رفض التفويض
            });
        }

        // Verify token
        // التحقق من صحة الرمز
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user by ID
        // البحث عن المستخدم بواسطة المعرف
        const user = await User.findById(decoded.userId).select('-password');
        
        // Check if user exists
        // التحقق من وجود المستخدم
        if (!user) {
            return res.status(401).json({ 
                message: 'Token is not valid' // الرمز غير صالح
            });
        }

        // Attach user to request object
        // إرفاق المستخدم بكائن الطلب
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            message: 'Token is not valid' // الرمز غير صالح
        });
    }
}; 