const express = require('express');
const feedController = require('../controllers/feedController');

const router = express.Router();

// Route to fetch all feed posts
router.get('/', feedController.getFeed);

// Route to add a new feed item
router.post('/', feedController.addToFeed);

module.exports = router;
