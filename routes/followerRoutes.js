const express = require('express');
const followerController = require('../controllers/followerController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Follow a user
router.post('/follow', followerController.followUser);

// Unfollow a user
router.post('/unfollow', followerController.unfollowUser);

// Get a user's followers
router.get('/:userId/followers', followerController.getFollowers);

// Get users a specific user is following
router.get('/:userId/following', followerController.getFollowing);

module.exports = router;
