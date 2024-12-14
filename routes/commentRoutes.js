const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

// Route to add a new comment
router.post('/', commentController.addComment);

// Route to retrieve all comments for a post
router.get('/:postId', commentController.getCommentsByPostId);

module.exports = router;
