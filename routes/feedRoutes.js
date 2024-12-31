const express = require('express');
const feedController = require('../controllers/feedController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Retrieve the feed (public or following)
router.get('/', feedController.getFeed);

module.exports = router;
