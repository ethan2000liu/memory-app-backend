const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Public routes (no auth required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/resend-verification', authController.resendVerificationEmail);
router.get('/verify-email/:email', authController.checkEmailVerification);

module.exports = router; 