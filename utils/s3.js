const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug: Log environment variables
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Generate a pre-signed URL for uploading files
exports.generateUploadURL = async (key, contentType) => {
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME is not defined in the environment variables');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Bucket name from .env
    Key: key, // File key
    ContentType: contentType, // MIME type
  };

  try {
    // Create a command for the PutObject operation
    const command = new PutObjectCommand(params);

    // Generate a pre-signed URL
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // Expires in 60 seconds
    return uploadURL;
  } catch (error) {
    console.error('Error generating S3 upload URL:', error);
    throw error;
  }
};
