const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get user profile
router.get('/:id', userController.getUserProfile);

// Update own profile (new route)
router.put('/profile', userController.updateProfile);

// Get account status
router.get('/status/account', userController.getAccountStatus);

// Update account status
router.put('/status/account', userController.updateAccountStatus);

module.exports = router;
