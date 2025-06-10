// IMPORTANT: Run this server from the project root (JetSetGo-main), not from the server/ directory.
// Example: cd .. && npm start --prefix server
// This ensures dotenv loads the correct .env file from the project root.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const fs = require('fs');

/**
 * Load environment variables from .env in project root
 * تحميل متغيرات البيئة من ملف .env في المجلد الرئيسي للمشروع
 */
dotenv.config();

// Debug environment variables
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***' : 'Not set');
console.log('PORT:', process.env.PORT || 5002);
console.log('UNSPLASH_ACCESS_KEY:', process.env.UNSPLASH_ACCESS_KEY);

// MongoDB connection configuration
// IMPORTANT: Your .env MONGODB_URI must include the database name, e.g. ...mongodb.net/jetsetgo
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in your .env file. Please add it and restart the server.');
    process.exit(1);
}

// Create Express app
const app = express();

/**
 * Middleware Configuration
 * تكوين الوسائط
 */
app.use(cors()); // Enable CORS for all routes // تمكين CORS لجميع المسارات
app.use(express.json()); // Parse JSON request bodies // تحليل أجسام طلبات JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies // تحليل الأجسام المشفرة في URL

/**
 * SSL/TLS Configuration for Production
 * تكوين SSL/TLS للإنتاج
 * Enables HTTPS in production environment
 * تمكين HTTPS في بيئة الإنتاج
 */
let server;
if (process.env.NODE_ENV === 'production') {
    const options = {
        key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
        cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.crt'))
    };
    server = https.createServer(options, app);
} else {
    server = app;
}

// Database connection with retry logic
const connectWithRetry = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s // انتهاء المهلة بعد 5 ثوانٍ بدلاً من 30 ثانية
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity // إغلاق المقابس بعد 45 ثانية من عدم النشاط
        });
        console.log('Connected to MongoDB'); // تم الاتصال بـ MongoDB
        
        // Start server only after database connection
        // بدء الخادم فقط بعد اتصال قاعدة البيانات
        const PORT = process.env.PORT || 5002;
        if (process.env.NODE_ENV === 'production') {
            server.listen(PORT, () => {
                console.log(`Server running on port ${PORT} with HTTPS`); // الخادم يعمل على المنفذ ${PORT} مع HTTPS
            });
        } else {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT} with HTTP`); // الخادم يعمل على المنفذ ${PORT} مع HTTP
            });
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...'); // إعادة محاولة الاتصال بعد 5 ثوانٍ
        setTimeout(connectWithRetry, 5000);
    }
};

// Initial connection attempt
// محاولة الاتصال الأولية
connectWithRetry();

// Routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes // مسارات المصادقة
app.use('/api/destinations', require('./routes/destinations')); // Destination routes // مسارات الوجهات
app.use('/api/accommodations', require('./routes/accommodations')); // Accommodation routes // مسارات الإقامة
app.use('/api/activities', require('./routes/activities')); // Activity routes // مسارات الأنشطة
app.use('/api/recommendations', require('./routes/recommendations')); // Recommendation routes // مسارات التوصيات

/**
 * Error Handling Middleware
 * وسيط معالجة الأخطاء
 * Handles all unhandled errors in the application
 * يتعامل مع جميع الأخطاء غير المعالجة في التطبيق
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!', // حدث خطأ ما
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;