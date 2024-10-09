const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// Route to scrape a news website
router.post('/', scraperController.scrapeWebsite);

module.exports = router;