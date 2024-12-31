const express = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Route to like a post
router.post('/', likeController.likePost);

// Route to unlike a post
router.delete('/', likeController.unlikePost);

// Route to retrieve all likes for a post
router.get('/:memoryId', likeController.getLikesByPostId);

module.exports = router;
