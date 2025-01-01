const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get user profile
router.get('/:id', userController.getUserProfile);

// Update own profile (new route)
router.put('/profile', userController.updateProfile);

module.exports = router;
