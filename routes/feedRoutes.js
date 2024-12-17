const express = require('express');
const feedController = require('../controllers/feedController');

const router = express.Router();

// Retrieve the feed (public or following)
router.get('/', feedController.getFeed);

module.exports = router;
