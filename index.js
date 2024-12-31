const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const authMiddleware = require('./middleware/auth');

// Import route files
const feedRoutes = require('./routes/feedRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const userRoutes = require('./routes/userRoutes');
const followerRoutes = require('./routes/followerRoutes'); // Add this import
const s3Routes = require('./routes/s3Routes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Add cors middleware before other middleware
app.use(cors({
  origin: 'http://localhost:8081', // Your frontend URL
  credentials: true, // If you're using cookies/sessions
}));

app.use(express.json());

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/feed', authMiddleware, feedRoutes);
app.use('/comments', authMiddleware, commentRoutes);
app.use('/likes', authMiddleware, likeRoutes);
app.use('/memories', authMiddleware, memoryRoutes);
app.use('/users', authMiddleware, userRoutes);
app.use('/followers', authMiddleware, followerRoutes);
app.use('/s3', authMiddleware, s3Routes);

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

