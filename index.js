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

// --- SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
