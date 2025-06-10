// هاد الـ config فيه كل الـ configuration اللي محتاجينها للـ APIs
const config = {
    // هاد الـ URL الأساسي للـ API
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api',
    // هاد الـ key للـ Google Places API
    GOOGLE_PLACES_API_KEY: process.env.REACT_APP_GOOGLE_PLACES_API_KEY,
    // هاد الـ key للـ Booking.com API
    BOOKING_API_KEY: process.env.REACT_APP_BOOKING_API_KEY
};

export default config;