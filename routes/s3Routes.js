const express = require('express');
const s3Controller = require('../controllers/s3Controller');

const router = express.Router();

// Route to get a pre-signed URL for S3 uploads
router.post('/upload-url', s3Controller.getUploadURL);

// Route to get a pre-signed URL for S3 downloads
router.post('/download-url', s3Controller.getDownloadURL);

module.exports = router; // Export router
