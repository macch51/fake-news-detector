const express = require('express');
const router = express.Router(); // Correct: Now it's an instance of Router
const apiController = require('../controllers/apiController');

// Route to fetch news from external API
router.get('/news', apiController.getNews);

module.exports = router;