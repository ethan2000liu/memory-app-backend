const express = require('express');
const dotenv = require('dotenv');
const feedRoutes = require('./routes/feedRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/feed', feedRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const commentRoutes = require('./routes/commentRoutes');

// Add the comments routes
app.use('/comments', commentRoutes);

const likeRoutes = require('./routes/likeRoutes');

// Add the likes routes
app.use('/likes', likeRoutes);


const memoryRoutes = require('./routes/memoryRoutes');

// Add the memories routes
app.use('/memories', memoryRoutes);

const userRoutes = require('./routes/userRoutes');

// Add the users routes
app.use('/users', userRoutes);
