const db = require('../db');

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT id, email, name, avatar_url, created_at
      FROM users
      WHERE id = $1;
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving user profile' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { name, avatar_url } = req.body;

  try {
    const query = `
      UPDATE users
      SET name = $1, avatar_url = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, name, avatar_url, created_at;
    `;
    const values = [name, avatar_url, id];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user profile' });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
    const { email, name, avatar_url } = req.body;
  
    // Validate input
    if (!email || !name) {
      return res.status(400).json({ error: 'email and name are required' });
    }
  
    try {
      const query = `
        INSERT INTO users (email, name, avatar_url)
        VALUES ($1, $2, $3)
        RETURNING id, email, name, avatar_url, created_at;
      `;
      const values = [email, name, avatar_url];
      const result = await db.query(query, values);
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creating user' });
    }
  };
  