const express = require('express');
const s3Controller = require('../controllers/s3Controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Route to get a pre-signed URL for S3 uploads
router.post('/upload-url', s3Controller.getUploadUrl);

// Route to get a pre-signed URL for S3 downloads
router.post('/download-url', s3Controller.getDownloadUrl);

module.exports = router; // Export router
