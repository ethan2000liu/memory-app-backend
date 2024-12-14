const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Get user profile
router.get('/:id', userController.getUserProfile);

// Update user profile
router.put('/:id', userController.updateUserProfile);

module.exports = router;

router.post('/', userController.createUser);
