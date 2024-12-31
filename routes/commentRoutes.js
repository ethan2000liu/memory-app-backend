const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Add a comment to a memory
router.post('/', commentController.addComment);

// Get all comments for a specific memory
router.get('/:memoryId', commentController.getCommentsByMemoryId);

// Delete a comment
router.delete('/', commentController.deleteComment);

module.exports = router;
