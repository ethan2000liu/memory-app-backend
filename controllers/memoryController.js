const db = require('../db'); // Import database connection

// Create a new memory
exports.createMemory = async (req, res) => {
  const { user_id, description, file_url, tags } = req.body;

  if (!user_id || !file_url) {
    return res.status(400).json({ error: 'user_id and file_url are required' });
  }

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
};

// Retrieve all memories for a user
exports.getMemoriesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT * FROM memories
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving memories' });
  }
};

// Retrieve a specific memory
exports.getMemoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT * FROM memories
      WHERE id = $1;
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving memory' });
  }
};

// Edit a memory
exports.editMemory = async (req, res) => {
  const { id } = req.params;
  const { description, tags } = req.body;

  try {
    const query = `
      UPDATE memories
      SET description = $1, tags = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [description, tags, id];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating memory' });
  }
};

// Delete a memory
exports.deleteMemory = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      DELETE FROM memories
      WHERE id = $1
      RETURNING *;
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting memory' });
  }
};
