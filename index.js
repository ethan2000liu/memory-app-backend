const express = require('express');
const dotenv = require('dotenv');

// Import route files
const feedRoutes = require('./routes/feedRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const userRoutes = require('./routes/userRoutes');
const followerRoutes = require('./routes/followerRoutes'); // Add this import
const s3Routes = require('./routes/s3Routes');

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/feed', feedRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/memories', memoryRoutes);
app.use('/users', userRoutes);
app.use('/followers', followerRoutes); 
app.use('/s3', s3Routes);




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

