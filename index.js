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

  
// --- SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
