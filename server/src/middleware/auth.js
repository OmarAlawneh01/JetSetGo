const jwt = require('jsonwebtoken');
const User = require('../models/User');


module.exports = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({ 
                message: 'No token, authorization denied' // لا يوجد رمز، تم رفض التفويض
            });
        }

        // Verify token
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
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            message: 'Token is not valid' // الرمز غير صالح
        });
    }
}; 