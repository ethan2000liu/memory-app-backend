const db = require('../db'); // Import database connection

// Helper function to check ownership
const isOwner = (memoryUserId, requesterId) => memoryUserId === requesterId;

// Create a new memory
exports.createMemory = async (req, res) => {
  const { description, file_url, tags, is_public } = req.body;
  const user_id = req.user.user_id; // Get user_id from authenticated token

  if (!file_url) {
    return res.status(400).json({ error: 'file_url is required' });
  }

  try {
    const query = `
      INSERT INTO memories (user_id, description, file_url, tags, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [user_id, description, file_url, tags, is_public || false];
    const result = await db.query(query, values);

    return res.status(201).json({
      message: 'Memory created successfully',
      memory: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating memory:', err);
    return res.status(500).json({ error: 'Internal server error' });
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
    return res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving memories:', err);
    return res.status(500).json({ error: 'Internal server error' });
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

    return res.json(memory);
  } catch (err) {
    console.error('Error retrieving memory:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Edit a memory
exports.editMemory = async (req, res) => {
  const { memory_id, description, tags, file_url } = req.body;
  const user_id = req.user.user_id;

  if (!memory_id) {
    return res.status(400).json({ error: 'memory_id is required' });
  }

  try {
    // First check if memory exists and belongs to user
    const checkQuery = `
      SELECT * FROM memories 
      WHERE id = $1
    `;
    const checkResult = await db.query(checkQuery, [memory_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Check ownership
    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: 'You can only edit your own memories' });
    }

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let values = [];
    let valueIndex = 1;

    if (description !== undefined) {
      updateFields.push(`description = $${valueIndex}`);
      values.push(description);
      valueIndex++;
    }

    if (tags !== undefined) {
      updateFields.push(`tags = $${valueIndex}`);
      values.push(tags);
      valueIndex++;
    }

    if (file_url !== undefined) {
      updateFields.push(`file_url = $${valueIndex}`);
      values.push(file_url);
      valueIndex++;
    }

    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update provided' });
    }

    // Add memory_id and user_id to values array
    values.push(memory_id);
    values.push(user_id);

    const updateQuery = `
      UPDATE memories 
      SET ${updateFields.join(', ')}
      WHERE id = $${valueIndex} AND user_id = $${valueIndex + 1}
      RETURNING *;
    `;

    const result = await db.query(updateQuery, values);

    res.json({
      message: 'Memory updated successfully',
      memory: result.rows[0]
    });

  } catch (err) {
    console.error('Error editing memory:', err);
    res.status(500).json({ error: 'Error editing memory' });
  }
};

// Delete a memory
exports.deleteMemory = async (req, res) => {
  const { memory_id } = req.body;
  const user_id = req.user.user_id;

  if (!memory_id) {
    return res.status(400).json({ error: 'memory_id is required' });
  }

  try {
    // First check if memory exists and belongs to user
    const checkQuery = `
      SELECT * FROM memories 
      WHERE id = $1
    `;
    const checkResult = await db.query(checkQuery, [memory_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Check ownership
    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: 'You can only delete your own memories' });
    }

    // Delete the memory
    const deleteQuery = `
      DELETE FROM memories 
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await db.query(deleteQuery, [memory_id, user_id]);

    res.json({
      message: 'Memory deleted successfully',
      memory: result.rows[0]
    });

  } catch (err) {
    console.error('Error deleting memory:', err);
    res.status(500).json({ error: 'Error deleting memory' });
  }
};

// Toggle memory privacy
exports.togglePrivacy = async (req, res) => {
  const { memory_id, is_public } = req.body;
  const user_id = req.user.user_id;

  if (!memory_id || typeof is_public !== 'boolean') {
    return res.status(400).json({ 
      error: 'memory_id and is_public (boolean) are required' 
    });
  }

  try {
    // First check if memory exists and belongs to user
    const checkQuery = `
      SELECT * FROM memories 
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await db.query(checkQuery, [memory_id, user_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Memory not found or you don\'t have permission to modify it' 
      });
    }

    // Update privacy setting
    const updateQuery = `
      UPDATE memories 
      SET is_public = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
    const result = await db.query(updateQuery, [is_public, memory_id, user_id]);

    res.json({
      message: 'Privacy setting updated successfully',
      memory: result.rows[0]
    });

  } catch (err) {
    console.error('Error toggling privacy:', err);
    res.status(500).json({ error: 'Error updating privacy setting' });
  }
};

// Get all memories (with privacy control)
exports.getAllMemories = async (req, res) => {
  const requestingUserId = req.user.user_id;
  const { user_id } = req.query; // Optional: filter by specific user

  try {
    let query = `
      SELECT 
        m.*,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;
    
    const values = [];
    let valueIndex = 1;

    // If specific user's memories are requested
    if (user_id) {
      query += ` AND m.user_id = $${valueIndex}`;
      values.push(user_id);
      valueIndex++;

      // If not the owner, only show public memories
      if (user_id !== requestingUserId) {
        query += ` AND m.is_public = true`;
      }
    } else {
      // If no specific user, show:
      // 1. All public memories
      // 2. All of requesting user's memories
      query += ` AND (m.is_public = true OR m.user_id = $${valueIndex})`;
      values.push(requestingUserId);
      valueIndex++;
    }

    query += ` ORDER BY m.created_at DESC`;

    const result = await db.query(query, values);

    return res.json({
      memories: result.rows,
      isOwner: user_id ? user_id === requestingUserId : false
    });
  } catch (err) {
    console.error('Error retrieving memories:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
