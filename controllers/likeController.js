const db = require('../db'); // Import database connection

// Like a memory
exports.likePost = async (req, res) => {
  const { memory_id } = req.body;
  const user_id = req.user.user_id; // Get from auth token

  if (!memory_id) {
    return res.status(400).json({ error: 'memory_id is required' });
  }

  try {
    // Check if the user already liked the memory
    const checkQuery = `
      SELECT * FROM likes
      WHERE memory_id = $1 AND user_id = $2;
    `;
    const checkResult = await db.query(checkQuery, [memory_id, user_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'User has already liked this memory' });
    }

    // Insert a new like
    const insertQuery = `
      INSERT INTO likes (memory_id, user_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const insertResult = await db.query(insertQuery, [memory_id, user_id]);

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error('Error liking memory:', err);
    res.status(500).json({ error: 'Error liking memory' });
  }
};

// Unlike a memory
exports.unlikePost = async (req, res) => {
  const { memory_id } = req.body;
  const user_id = req.user.user_id; // Get from auth token

  if (!memory_id) {
    return res.status(400).json({ error: 'memory_id is required' });
  }

  try {
    const deleteQuery = `
      DELETE FROM likes
      WHERE memory_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await db.query(deleteQuery, [memory_id, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }

    res.json({ message: 'Memory unliked successfully' });
  } catch (err) {
    console.error('Error unliking memory:', err);
    res.status(500).json({ error: 'Error unliking memory' });
  }
};

// Get likes for a memory
exports.getLikesByPostId = async (req, res) => {
  try {
    // Clean up the memoryId parameter
    const memoryId = req.params.memoryId.replace(/[^a-zA-Z0-9-]/g, '');

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(memoryId)) {
      return res.status(400).json({ error: 'Invalid memory ID format' });
    }

    const query = `
      SELECT 
        l.*,
        u.name as user_name,
        u.avatar_url as user_avatar,
        u.email as user_email
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.memory_id = $1
      ORDER BY l.created_at DESC;
    `;
    const result = await db.query(query, [memoryId]);

    const response = {
      likes: result.rows,
      total_count: result.rows.length
    };

    res.json(response);
  } catch (err) {
    console.error('Error getting likes:', err);
    res.status(500).json({ error: 'Error getting likes' });
  }
};
