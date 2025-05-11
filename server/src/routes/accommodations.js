const express = require('express');
const router = express.Router();

// GET /api/accommodations
router.get('/', (req, res) => {
    res.json({ message: 'Accommodations endpoint' });
});

module.exports = router; 