const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

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
app.use('/feed', feedRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/memories', memoryRoutes);
app.use('/users', userRoutes);
app.use('/followers', followerRoutes); 
app.use('/s3', s3Routes);
app.use('/auth', authRoutes);




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

