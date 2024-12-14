const AWS = require('aws-sdk');
require('dotenv').config(); // Load environment variables from .env file

// Configure AWS SDK with environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME;

// Generate a pre-signed URL for uploading a file
const generatePresignedUploadUrl = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: 60 * 5, // URL expires in 5 minutes
    ContentType: 'image/jpeg' // Set the file type
  };

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    console.log('Pre-Signed URL for Upload:', uploadUrl);
    return uploadUrl;
  } catch (err) {
    console.error('Error generating upload URL:', err);
  }
};

// Generate a pre-signed URL for downloading a file
const generatePresignedDownloadUrl = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: 60 * 5 // URL expires in 5 minutes
  };

  try {
    const downloadUrl = await s3.getSignedUrlPromise('getObject', params);
    console.log('Pre-Signed URL for Download:', downloadUrl);
    return downloadUrl;
  } catch (err) {
    console.error('Error generating download URL:', err);
  }
};

// Test the functions
const testPresignedUrls = async () => {
  const fileName = 'test-image.jpg'; // Change this to the file name you want to test
  console.log('Generating upload URL...');
  await generatePresignedUploadUrl(fileName);

  console.log('Generating download URL...');
  await generatePresignedDownloadUrl(fileName);
};

testPresignedUrls();
