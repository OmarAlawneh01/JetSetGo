const express = require('express');
const router = express.Router();

// GET /api/activities
router.get('/', (req, res) => {
    res.json({ message: 'Activities endpoint' });
});

module.exports = router; 