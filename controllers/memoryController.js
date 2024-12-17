const db = require('../db'); // Import database connection

// Helper function to check ownership
const isOwner = (memoryUserId, requesterId) => memoryUserId === requesterId;

// Create a new memory
exports.createMemory = async (req, res) => {
  const { user_id, description, file_url, tags, is_public } = req.body;

  if (!user_id || !file_url) {
    return res.status(400).json({ error: 'user_id and file_url are required' });
  }

  try {
    const query = `
      INSERT INTO memories (user_id, description, file_url, tags, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [user_id, description, file_url, tags, is_public || false];
    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating memory' });
  }
};

// Retrieve all memories for a user (public or private depending on ownership)
exports.getMemoriesByUser = async (req, res) => {
  const { userId } = req.params; // Owner ID
  const { requester_id } = req.body; // Logged-in user ID

  try {
    const query = `
      SELECT * FROM memories 
      WHERE user_id = $1 ${userId === requester_id ? '' : 'AND is_public = TRUE'}
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
  const { requester_id } = req.body;

  try {
    const query = `SELECT * FROM memories WHERE id = $1;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = result.rows[0];
    if (!memory.is_public && memory.user_id !== requester_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(memory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving memory' });
  }
};

// Edit a memory (only owner)
exports.editMemory = async (req, res) => {
  const { id, description, tags, requester_id } = req.body;

  try {
    const query = `SELECT user_id FROM memories WHERE id = $1;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = result.rows[0];
    if (!isOwner(memory.user_id, requester_id)) {
      return res.status(403).json({ error: 'Not authorized to edit this memory' });
    }

    const updateQuery = `
      UPDATE memories SET description = $1, tags = $2 WHERE id = $3 RETURNING *;
    `;
    const updateResult = await db.query(updateQuery, [description, tags, id]);

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating memory' });
  }
};

// Delete a memory (only owner)
exports.deleteMemory = async (req, res) => {
  const { id, requester_id } = req.body;

  try {
    const query = `SELECT user_id FROM memories WHERE id = $1;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = result.rows[0];
    if (!isOwner(memory.user_id, requester_id)) {
      return res.status(403).json({ error: 'Not authorized to delete this memory' });
    }

    const deleteQuery = `DELETE FROM memories WHERE id = $1 RETURNING *;`;
    const deleteResult = await db.query(deleteQuery, [id]);

    res.json({ message: 'Memory deleted successfully', memory: deleteResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting memory' });
  }
};

// Toggle privacy of a memory
exports.togglePrivacy = async (req, res) => {
  const { id, is_public, requester_id } = req.body;

  try {
    const query = `SELECT user_id FROM memories WHERE id = $1;`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = result.rows[0];
    if (!isOwner(memory.user_id, requester_id)) {
      return res.status(403).json({ error: 'Not authorized to update privacy' });
    }

    const updateQuery = `
      UPDATE memories SET is_public = $1 WHERE id = $2 RETURNING *;
    `;
    const updateResult = await db.query(updateQuery, [is_public, id]);

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating privacy' });
  }
};
