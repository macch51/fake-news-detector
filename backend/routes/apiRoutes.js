const express = require('express');
const router = express.Router(); // Correct: Now it's an instance of Router
const apiController = require('../controllers/apiController');

// Route to fetch news from external API
router.post('/check-news', apiController.checkNews);

module.exports = router;