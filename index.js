const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// Database Connection
const db = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
db.connect();

// --- USERS API ---
// Create a new user
app.post('/users', async (req, res) => {
  const { name, email, avatar_url } = req.body;
  try {
    const query = `
      INSERT INTO users (name, email, avatar_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, email, avatar_url];
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Retrieve user details
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM users WHERE id = $1;`;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving user' });
  }
});

// --- MEMORIES API ---
// Create a memory
app.post('/memories', async (req, res) => {
  const { user_id, description, file_url, tags } = req.body;
  try {
    const query = `
      INSERT INTO memories (user_id, description, file_url, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user_id, description, file_url, tags];
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating memory' });
  }
});

// Retrieve a specific memory
app.get('/memories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM memories WHERE id = $1;`;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving memory' });
  }
});

// Retrieve all memories for a specific user
app.get('/memories/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC;`;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving user memories' });
  }
});

// --- FEED API ---

// Retrieve the feed (all shared posts with likes/comments count)
app.get('/feed', async (req, res) => {
    try {
      const query = `
        SELECT 
          feed.id, 
          feed.user_id, 
          feed.memory_id, 
          feed.likes_count, 
          feed.comments_count, 
          feed.created_at, 
          memories.description, 
          memories.file_url, 
          users.name AS user_name
        FROM feed
        JOIN memories ON feed.memory_id = memories.id
        JOIN users ON feed.user_id = users.id
        ORDER BY feed.created_at DESC;
      `;
      const result = await db.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error retrieving feed' });
    }
  });
  
  // Add a new feed item
  app.post('/feed', async (req, res) => {
    const { user_id, memory_id } = req.body;
    try {
      const query = `
        INSERT INTO feed (user_id, memory_id, likes_count, comments_count)
        VALUES ($1, $2, 0, 0)
        RETURNING *;
      `;
      const values = [user_id, memory_id];
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error adding to feed' });
    }
  });

  // --- COMMENTS API ---

// Add a comment to a post
app.post('/comments', async (req, res) => {
    const { post_id, user_id, content } = req.body;
    try {
      const query = `
        INSERT INTO comments (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const values = [post_id, user_id, content];
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error adding comment' });
    }
  });
  
  // Retrieve comments for a specific post
  app.get('/comments/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
      const query = `
        SELECT 
          comments.id, 
          comments.user_id, 
          comments.content, 
          comments.created_at, 
          users.name AS user_name
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.post_id = $1
        ORDER BY comments.created_at DESC;
      `;
      const result = await db.query(query, [postId]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error retrieving comments' });
    }
  });
  
  // --- LIKES API ---

// Like a post
app.post('/likes', async (req, res) => {
    const { post_id, user_id } = req.body;
    try {
      // Check if the user already liked the post
      const checkQuery = `
        SELECT * FROM likes
        WHERE post_id = $1 AND user_id = $2;
      `;
      const checkResult = await db.query(checkQuery, [post_id, user_id]);
  
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'User has already liked this post' });
      }
  
      // Insert a new like
      const insertQuery = `
        INSERT INTO likes (post_id, user_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const insertResult = await db.query(insertQuery, [post_id, user_id]);
  
      // Update likes_count in feed
      const updateQuery = `
        UPDATE feed
        SET likes_count = likes_count + 1
        WHERE id = $1;
      `;
      await db.query(updateQuery, [post_id]);
  
      res.status(201).json(insertResult.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error liking post' });
    }
  });
    
// Unlike a post
app.delete('/likes', async (req, res) => {
    const { post_id, user_id } = req.body;
    try {
      // Check if the user has already liked the post
      const checkQuery = `
        SELECT * FROM likes
        WHERE post_id = $1 AND user_id = $2;
      `;
      const checkResult = await db.query(checkQuery, [post_id, user_id]);
  
      if (checkResult.rows.length === 0) {
        return res.status(400).json({ error: 'Cannot unlike because the post is not liked' });
      }
  
      // Delete the like
      const deleteQuery = `
        DELETE FROM likes
        WHERE post_id = $1 AND user_id = $2
        RETURNING *;
      `;
      const deleteResult = await db.query(deleteQuery, [post_id, user_id]);
  
      // Update likes_count in feed
      const updateQuery = `
        UPDATE feed
        SET likes_count = likes_count - 1
        WHERE id = $1;
      `;
      await db.query(updateQuery, [post_id]);
  
      res.json(deleteResult.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error unliking post' });
    }
  });
  
  
  // Get likes for a specific post
  app.get('/likes/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
      const query = `
        SELECT 
          likes.user_id, 
          likes.created_at, 
          users.name AS user_name
        FROM likes
        JOIN users ON likes.user_id = users.id
        WHERE likes.post_id = $1;
      `;
      const result = await db.query(query, [postId]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error retrieving likes' });
    }
  });
  
  
// --- SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
