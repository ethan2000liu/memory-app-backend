const express = require('express');
const likeController = require('../controllers/likeController');

const router = express.Router();

// Route to like a post
router.post('/', likeController.likePost);

// Route to unlike a post
router.delete('/', likeController.unlikePost);

// Route to retrieve all likes for a post
router.get('/:postId', likeController.getLikesByPostId);

module.exports = router;
