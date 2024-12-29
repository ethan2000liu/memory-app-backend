const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify-email/:email', authController.checkEmailVerification);
router.post('/resend-verification', authController.resendVerificationEmail);

module.exports = router; 