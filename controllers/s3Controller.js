const { generateUploadURL, generateDownloadURL } = require('../utils/s3');

// Generate a pre-signed S3 upload URL
exports.getUploadURL = async (req, res) => {
  const { key, contentType } = req.body;

  if (!key || !contentType) {
    return res.status(400).json({ error: 'File key and content type are required' });
  }

  // Additional validation for key
  if (key.trim() === '') {
    return res.status(400).json({ error: 'File key cannot be empty' });
  }

  try {
    const uploadURL = await generateUploadURL(key, contentType);
    res.status(200).json({ uploadURL });
  } catch (err) {
    console.error('Error generating S3 upload URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};


// Generate a pre-signed S3 download URL
exports.getDownloadURL = async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'File key is required' });
  }

  try {
    const downloadURL = await generateDownloadURL(key);
    res.status(200).json({ downloadURL });
  } catch (err) {
    console.error('Error generating S3 download URL:', err);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};
