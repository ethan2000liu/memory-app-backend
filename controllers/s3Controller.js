const { generateUploadURL } = require('../utils/s3');

// Generate a pre-signed S3 URL
exports.getUploadURL = async (req, res) => {
  const { key, contentType } = req.body;

  if (!key || !contentType) {
    return res.status(400).json({ error: 'File key and content type are required' });
  }

  try {
    const uploadURL = await generateUploadURL(key, contentType);
    res.status(200).json({ uploadURL });
  } catch (err) {
    console.error('Error generating S3 upload URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};
